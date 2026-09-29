import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getColumnsByProjectId } from '../../services/columns.service';

export default async function getColumnsController(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const projectId = typeof req.query.project_id === 'string' ? req.query.project_id : '';
    const columns = await getColumnsByProjectId(projectId);
    return res.status(200).json(columns || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
};
