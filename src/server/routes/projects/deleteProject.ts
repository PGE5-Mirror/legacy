import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getProjectById, removeProject } from '../../services/projects.service';

export default async function deleteProjectController(
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

    if (!id) return res.status(404).json({ error: 'Missing id' });

    const existing = await getProjectById(id);
    if (!existing) {
      return res.status(404).json({ message: `Project not found` });
    }

    await removeProject(id);
    return res.sendStatus(204);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
}
