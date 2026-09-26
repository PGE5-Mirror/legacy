import { Response } from 'express';
import * as db from '../persistence';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const FONT_SIZES = ['small', 'medium', 'large'];

export default async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. Missing token.' });
    }

    const { high_contrast, font_size } = req.body;

    if (high_contrast !== undefined && typeof high_contrast !== 'boolean') {
      return res.status(400).json({ error: 'high_contrast must be a boolean' });
    }

    if (font_size !== undefined && !FONT_SIZES.includes(font_size)) {
      return res.status(400).json({ error: 'font_size must be small, medium or large' });
    }

    const settings = await db.upsertUserSettings(req.user.id, { high_contrast, font_size });
    return res.status(200).json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
};
