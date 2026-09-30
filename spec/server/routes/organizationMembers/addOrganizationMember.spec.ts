import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import addOrganizationMemberController from '../../../../src/server/routes/organizationMembers/addOrganizationMember';
import * as organizationMembersService from '../../../../src/server/services/organizationMembers.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/organizationMembers.service', () => ({
  createOrganizationMember: jest.fn(),
}));

describe('addOrganizationMemberController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
      body: { added_user_id: 'user-uuid-123', role: 'admin' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should add an organization member successfully and return status 201', async () => {
    const mockCreatedMember = { id: 'member-123', organization_id: 'org-uuid-123', user_id: 'user-uuid-123', role: 'admin' };

    (organizationMembersService.createOrganizationMember as jest.Mock).mockResolvedValue(mockCreatedMember);

    await addOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationMembersService.createOrganizationMember).toHaveBeenCalledWith({
      organization_id: 'org-uuid-123',
      user_id: 'user-uuid-123',
      role: 'admin',
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockCreatedMember);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await addOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(organizationMembersService.createOrganizationMember).not.toHaveBeenCalled();
  });

  it('should return 400 if user_id is missing', async () => {
    mockReq.body = { role: 'admin' };

    await addOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing user_id' });
    expect(organizationMembersService.createOrganizationMember).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (organizationMembersService.createOrganizationMember as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addOrganizationMemberController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});