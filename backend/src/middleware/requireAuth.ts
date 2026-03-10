import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findUserById } from '../models/user';

export interface AuthTokenPayload {
  userId: string;
  workosId: string;
  email: string;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.auth_token as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.sessionSecret) as AuthTokenPayload;
    req.user = payload;
    next();
  } catch {
    res.clearCookie('auth_token');
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export async function requireAuthWithUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  requireAuth(req, res, async () => {
    const dbUser = await findUserById(req.user!.userId);
    if (!dbUser) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    next();
  });
}
