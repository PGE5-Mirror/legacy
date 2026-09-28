import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { updateItem, getItemById } from '../../services/items.service';

export default async function updateItemController(
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
    const { name, completed, column_id, assigned_to, position } = req.body;

    const existing = await getItemById(id);

    if (!existing) {
      return res.status(404).json({ message: `Item with id ${id} not found` });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (name !== undefined && (!name.trim || name.trim().length < 1)) {
      return res.status(400).json({ error: 'Task name cannot be empty' });
    }

    if (position !== undefined && (!Number.isInteger(position) || position < 0)) {
      return res.status(400).json({ error: 'Position must be a positive integer' });
    }

    const updatedItem = await updateItem(id, {
      name: name !== undefined ? name.trim() : undefined,
      completed,
      column_id,
      assigned_to,
      position,
    });

    return res.status(200).json(updatedItem);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}