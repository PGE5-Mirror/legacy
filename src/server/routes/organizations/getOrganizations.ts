import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getOrganizations } from '../../services/organization.service';
import { getOrganizationMemberByOrganizationId } from '../../services/organizationMembers.service';

export default async function getOrganizationsController(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const organizations = await getOrganizations();
    const finalOrganizations = (
      await Promise.all(
        organizations.map(async (organization) => {
          const organizationMembers = await getOrganizationMemberByOrganizationId(organization.id);
          const isMember = organizationMembers.some((member) => member.user_id === userId);
          return isMember ? organization : null;
        })
      )
    ).filter((org): org is NonNullable<typeof org> => org !== null);
    return res.status(200).json(finalOrganizations || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
};
