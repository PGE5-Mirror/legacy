import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getProjects } from '../../services/projects.service';
import { getOrganizationById } from '../../services/organization.service';
import { getOrganizationMemberByOrganizationId } from '../../services/organizationMembers.service';

export default async function getProjectsController(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const organizationMembers = await getOrganizationMemberByOrganizationId(id);
    const isMember = organizationMembers.some((member) => member.user_id === userId);

    if (!isMember)
        return res.status(401).json({ error: 'Unauthorized' });

    const projects = await getProjects(id);
    return res.status(200).json(projects || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
};
