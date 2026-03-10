import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { findUserById } from '../models/user';

const router = Router();

/**
 * GET /api/me
 * Returns the currently authenticated user's profile from the database.
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.user!.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePictureUrl: user.profile_picture_url,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
