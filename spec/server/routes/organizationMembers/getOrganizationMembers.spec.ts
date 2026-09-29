import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import getOrganizationMembersController from '../../../../src/server/routes/organizationMembers/getOrganizationMembers';
import * as organizationMembersService from '../../../../src/server/services/organizationMembers.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/organizationMembers.service', () => ({
  getOrganizationMemberById: jest.fn(),
}));

describe('getOrganizationMembersController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve organization members successfully and return status 200', async () => {
    const mockMembers = [{ id: 'member-1', organization_id: 'org-uuid-123', user_id: 'user-1' }];

    (organizationMembersService.getOrganizationMemberById as jest.Mock).mockResolvedValue(mockMembers);

    await getOrganizationMembersController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationMembersService.getOrganizationMemberById).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockMembers);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await getOrganizationMembersController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(organizationMembersService.getOrganizationMemberById).not.toHaveBeenCalled();
  });

  it('should return an empty array if no members are returned', async () => {
    (organizationMembersService.getOrganizationMemberById as jest.Mock).mockResolvedValue(null);

    await getOrganizationMembersController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationMembersService.getOrganizationMemberById).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 if an error occurs', async () => {
    (organizationMembersService.getOrganizationMemberById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getOrganizationMembersController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});