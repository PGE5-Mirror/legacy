import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { createOrganizationMember } from '../../services/organizationMembers.service';
import { createOrganization } from '../../services/organization.service';

export default async function addOrganizationController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const createdOrganization = await createOrganization({
      name: name,
    });

    await createOrganizationMember({
      organization_id: createdOrganization.id,
      user_id: userId,
      role: 'admin',
    });

    return res.status(201).json(createdOrganization);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
