import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { workos } from '../config/workos';
import { env } from '../config/env';
import { upsertUser } from '../models/user';
import type { AuthTokenPayload } from '../middleware/requireAuth';

const router = Router();

const CALLBACK_URL = `http://localhost:${env.port}/auth/callback`;
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * GET /auth/login
 * Redirects the user to the WorkOS hosted AuthKit login page.
 * Supports an optional `provider` query param for direct social login:
 *   ?provider=GoogleOAuth or ?provider=GitHubOAuth
 */
router.get('/login', (req: Request, res: Response) => {
  // Default to 'authkit' so WorkOS shows its full hosted UI (email + all social providers).
  // A specific provider like 'GoogleOAuth' or 'GitHubOAuth' skips straight to that provider.
  const provider = (req.query.provider as string | undefined) ?? 'authkit';

  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    provider: provider as 'authkit' | 'GoogleOAuth' | 'GitHubOAuth',
    redirectUri: CALLBACK_URL,
    clientId: env.workosClientId,
  });

  res.redirect(authorizationUrl);
});

/**
 * GET /auth/callback
 * WorkOS redirects here after authentication.
 * Exchanges the `code` for a user, upserts to DB, sets session cookie.
 */
router.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    res.redirect(`${env.frontendUrl}/login?error=missing_code`);
    return;
  }

  try {
    const { user: workosUser, accessToken } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: env.workosClientId,
    });

    // Extract the WorkOS session ID from the access token so we can
    // properly terminate the WorkOS session on logout.
    const decodedAccessToken = jwt.decode(accessToken) as { sid?: string } | null;
    const sessionId = decodedAccessToken?.sid ?? '';

    const dbUser = await upsertUser({
      workos_id: workosUser.id,
      email: workosUser.email,
      first_name: workosUser.firstName ?? null,
      last_name: workosUser.lastName ?? null,
      profile_picture_url: workosUser.profilePictureUrl ?? null,
    });

    const token = jwt.sign(
      { userId: dbUser.id, workosId: workosUser.id, email: workosUser.email, sessionId },
      env.sessionSecret,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_MS,
    });

    res.redirect(`${env.frontendUrl}/dashboard`);
  } catch (err) {
    console.error('Auth callback error:', err);
    res.redirect(`${env.frontendUrl}/login?error=auth_failed`);
  }
});

/**
 * GET /auth/logout
 * Clears the local session cookie and redirects to WorkOS to terminate
 * the WorkOS session too. Without this, WorkOS silently re-authenticates
 * the user on the next login attempt.
 */
router.get('/logout', (req: Request, res: Response) => {
  const token = req.cookies?.auth_token as string | undefined;

  res.clearCookie('auth_token', { httpOnly: true, sameSite: 'lax' });

  if (token) {
    try {
      const payload = jwt.verify(token, env.sessionSecret) as AuthTokenPayload;

      if (payload.sessionId) {
        const workosLogoutUrl = workos.userManagement.getLogoutUrl({
          sessionId: payload.sessionId,
        });
        res.redirect(workosLogoutUrl);
        return;
      }
    } catch {
      // Token is invalid/expired — just fall through to frontend redirect
    }
  }

  res.redirect(`${env.frontendUrl}/login`);
});

export default router;
