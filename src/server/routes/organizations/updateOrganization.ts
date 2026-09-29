import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getOrganizationById, updateOrganization } from '../../services/organization.service';

export default async function updateOrganizationController(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { name } = req.body;

    const existing = await getOrganizationById(id);
    if (!existing) {
      return res.status(404).json({ message: `Organization with id ${id} not found` });
    }

    await updateOrganization(id, { name });
    const organization = await getOrganizationById(id);
    return res.status(200).json(organization);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).send({ error: message });
  }
};
