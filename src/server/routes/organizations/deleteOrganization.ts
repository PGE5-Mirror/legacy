import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getOrganizationById, removeOrganization } from '../../services/organization.service';

export default async function deleteOrganizationController(
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

    const existing = await getOrganizationById(id);
    if (!existing) {
      return res.status(404).json({ message: `Organization not found` });
    }

    await removeOrganization(id);
    return res.sendStatus(204);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
}
