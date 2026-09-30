import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getColumnById, updateColumn } from '../../services/columns.service';

export default async function updateColumnController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { name, position } = req.body;

    const existing = await getColumnById(id);
    if (!existing) {
      return res.status(404).json({ message: `Column with id ${id} not found` });
    }

    await updateColumn(id, {
      name: name,
      position: position,
    });
    const column = await getColumnById(id);
    return res.status(200).json(column);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).send({ error: message });
  }
}
