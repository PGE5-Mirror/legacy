import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { createColumn } from '../../services/columns.service';

export default async function addColumnController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const { name, project_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!project_id) {
      return res.status(400).json({ error: 'Missing project_id' });
    }

    const createdColumn = await createColumn({ name, project_id });
    return res.status(201).json(createdColumn);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
