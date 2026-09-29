import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getProjectById, updateProject } from '../../services/projects.service';

export default async function updateProjectController(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { name } = req.body;

    const existing = await getProjectById(id);
    if (!existing) {
      return res.status(404).json({ message: `Project with id ${id} not found` });
    }

    await updateProject(id, {
      name: name,
    });
    const project = await getProjectById(id);
    return res.status(200).json(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).send({ error: message });
  }
};
