import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import {
  getOrganizationMemberById,
  removeOrganizationMember,
} from '../../services/organizationMembers.service';
import { isOrganizationAdmin } from '../../services/organization.service';

export default async function deleteOrganizationMemberController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rawOrganizationId = req.params.id;
    const organizationId = Array.isArray(rawOrganizationId)
      ? rawOrganizationId[0]
      : rawOrganizationId;

    const rawMemberId = req.params.memberId;
    const memberId = Array.isArray(rawMemberId) ? rawMemberId[0] : rawMemberId;

    const isAdmin = await isOrganizationAdmin(organizationId, userId);

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Only organization admins can remove members',
      });
    }

    const existing = await getOrganizationMemberById(memberId);

    if (!existing || existing.organization_id !== organizationId) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await removeOrganizationMember(memberId);
    return res.sendStatus(204);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return res.status(500).json({ error: message });
  }
}
