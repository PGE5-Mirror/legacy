import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { publishEvent } from '../../events/rabbitmq';
import { createItem } from '../../services/items.service';

export default async function addItemController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { name, column_id, assigned_to, position } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Missing title' });
    }

    if (position !== undefined && (!Number.isInteger(position) || position < 0)) {
      return res.status(400).json({ error: 'Position must be a positive integer' });
    }

    const createdTask = await createItem({
      name: name.trim(),
      user_id: userId,
      column_id: column_id || null,
      assigned_to: assigned_to || null,
      position: position ?? 0,
    });

    try {
      await publishEvent('TaskCreated', {
        taskId: createdTask.id,
        name: createdTask.name,
        columnId: createdTask.column_id,
        assignedTo: createdTask.assigned_to,
      });
    } catch (err) {
      console.error('Failed to publish TaskCreated event:', err);
    }

    return res.status(201).json(createdTask);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
