import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import deleteOrganizationMemberController from '../../../../src/server/routes/organizationMembers/deleteOrganizationMember';
import * as organizationMembersService from '../../../../src/server/services/organizationMembers.service';
import * as organizationService from '../../../../src/server/services/organization.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/organizationMembers.service', () => ({
  getOrganizationMemberById: jest.fn(),
  removeOrganizationMember: jest.fn(),
}));

jest.mock('../../../../src/server/services/organization.service', () => ({
  isOrganizationAdmin: jest.fn(),
}));

describe('deleteOrganizationMemberController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123', memberId: 'member-uuid-123' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };
  });

  it('should delete the organization member successfully and return status 204', async () => {
    const mockMember = { id: 'member-uuid-123', organization_id: 'org-uuid-123', user_id: 'user-uuid-123' };

    (organizationService.isOrganizationAdmin as jest.Mock).mockResolvedValue(true);
    (organizationMembersService.getOrganizationMemberById as jest.Mock).mockResolvedValue(mockMember);
    (organizationMembersService.removeOrganizationMember as jest.Mock).mockResolvedValue(undefined);

    await deleteOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationService.isOrganizationAdmin).toHaveBeenCalledWith('org-uuid-123', 'user-uuid-123');
    expect(organizationMembersService.getOrganizationMemberById).toHaveBeenCalledWith('member-uuid-123');
    expect(organizationMembersService.removeOrganizationMember).toHaveBeenCalledWith('member-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await deleteOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(organizationService.isOrganizationAdmin).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not an organization admin', async () => {
    (organizationService.isOrganizationAdmin as jest.Mock).mockResolvedValue(false);

    await deleteOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationService.isOrganizationAdmin).toHaveBeenCalledWith('org-uuid-123', 'user-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Only organization admins can remove members' });
    expect(organizationMembersService.removeOrganizationMember).not.toHaveBeenCalled();
  });

  it('should return 404 if the member does not exist or organization id does not match', async () => {
    (organizationService.isOrganizationAdmin as jest.Mock).mockResolvedValue(true);
    (organizationMembersService.getOrganizationMemberById as jest.Mock).mockResolvedValue(undefined);

    await deleteOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationService.isOrganizationAdmin).toHaveBeenCalledWith('org-uuid-123', 'user-uuid-123');
    expect(organizationMembersService.getOrganizationMemberById).toHaveBeenCalledWith('member-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Member not found' });
    expect(organizationMembersService.removeOrganizationMember).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (organizationService.isOrganizationAdmin as jest.Mock).mockResolvedValue(true);
    (organizationMembersService.getOrganizationMemberById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});