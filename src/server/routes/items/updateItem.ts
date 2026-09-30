import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { updateItem, getItemById } from '../../services/items.service';
import { TaskPriority } from '../../models/Task';

const allowedPriorities: TaskPriority[] = ['low', 'medium', 'high'];

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

    const { name, completed, column_id, assigned_to, position, priority, deadline } = req.body;

    const existing = await getItemById(id);

    if (!existing) {
      return res.status(404).json({ message: `Item with id ${id} not found` });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 1)) {
      return res.status(400).json({
        error: 'Task name cannot be empty',
      });
    }

    if (position !== undefined && (!Number.isInteger(position) || position < 0)) {
      return res.status(400).json({
        error: 'Position must be a positive integer',
      });
    }

    if (priority !== undefined && !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Priority must be low, medium, or high',
      });
    }

    if (deadline !== undefined && deadline !== null && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      return res.status(400).json({
        error: 'Deadline must use the YYYY-MM-DD format',
      });
    }

    const updatedItem = await updateItem(id, {
      name: name !== undefined ? name.trim() : undefined,
      completed,
      column_id,
      assigned_to,
      position,
      priority,
      deadline,
    });

    return res.status(200).json(updatedItem);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
