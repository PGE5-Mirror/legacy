import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getItemsByColumnId } from '../../services/items.service';

export default async function getItemsByColumnController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rawColumnId = req.params.id;
    const columnId = Array.isArray(rawColumnId) ? rawColumnId[0] : rawColumnId;

    const tasks = await getItemsByColumnId(columnId);

    return res.status(200).json(tasks);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
