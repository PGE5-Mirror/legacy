import { Response } from 'express';
import * as db from '../persistence';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export default async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. Missing token.' });
    }

    const settings = await db.getUserSettings(req.user.id);
    return res.status(200).json(
      settings ?? {
        user_id: req.user.id,
        high_contrast: false,
        font_size: 'medium',
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
};
