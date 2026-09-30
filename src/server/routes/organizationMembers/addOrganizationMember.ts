import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { createOrganizationMember } from '../../services/organizationMembers.service';

export default async function addOrganizationMemberController(
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
    const { added_user_id, role } = req.body;

    if (!added_user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    const createdMember = await createOrganizationMember({
      organization_id: id,
      user_id: added_user_id,
      role: role,
    });

    return res.status(201).json(createdMember);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
