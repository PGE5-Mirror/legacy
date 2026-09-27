import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getItemsByUserId } from '../../services/items.service';

export default async function getItemsController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const items = await getItemsByUserId(userId);
    return res.status(200).json(items || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
