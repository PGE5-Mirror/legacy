import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { Response } from 'express';
import { getOrganizationMemberById, removeOrganizationMember } from '../../services/organizationMembers.service';

export default async function deleteOrganizationMemberController(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const rawMemberId = req.params.memberId;
    const memberId = Array.isArray(rawMemberId) ? rawMemberId[0] : rawMemberId;

    const existing = await getOrganizationMemberById(memberId);
    if (!existing) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await removeOrganizationMember(memberId);
    return res.sendStatus(204);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
};
