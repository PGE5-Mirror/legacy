import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getUserSettings } from '../../services/userSettings.service';

export default async function getUserSettingsController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const settings = await getUserSettings(userId);
    return res.status(200).json(
      settings ?? {
        user_id: userId,
        high_contrast: false,
        font_size: 'medium',
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
