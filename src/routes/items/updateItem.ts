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
    const { name, completed } = req.body;

    const existing = await getItemById(id);
    if (!existing) {
      return res.status(404).json({ message: `Item with id ${id} not found` });
    }

    if (existing.userId && existing.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updateData = {
      id: id,
      name: name !== undefined ? name : existing.name,
      completed: completed !== undefined ? completed : existing.completed,
    };

    const updatedItem = await updateItem(updateData);
    return res.status(200).json(updatedItem);
  } catch (err: any) {
    return res.status(500).send({ error: err.message });
  }
}
