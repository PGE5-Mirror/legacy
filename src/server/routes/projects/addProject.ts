import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { createProject } from '../../services/projects.service';

export default async function addProjectController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { name } = req.body;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const createdProject = await createProject({
      name: name,
      organization_id: id,
    });
    return res.status(201).json(createdProject);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
