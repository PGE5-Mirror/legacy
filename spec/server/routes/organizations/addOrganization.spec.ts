import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import addOrganizationController from '../../../../src/server/routes/organizations/addOrganization';
import * as organizationService from '../../../../src/server/services/organization.service';
import * as organizationMembersService from '../../../../src/server/services/organizationMembers.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/organization.service', () => ({
  createOrganization: jest.fn(),
}));

jest.mock('../../../../src/server/services/organizationMembers.service', () => ({
  createOrganizationMember: jest.fn(),
}));

describe('addOrganizationController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: { name: 'New Organization' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should create an organization and add user as admin, then return status 201', async () => {
    const mockOrg = { id: 'org-uuid-123', name: 'New Organization' };

    (organizationService.createOrganization as jest.Mock).mockResolvedValue(mockOrg);
    (organizationMembersService.createOrganizationMember as jest.Mock).mockResolvedValue(undefined);

    await addOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationService.createOrganization).toHaveBeenCalledWith({ name: 'New Organization' });
    expect(organizationMembersService.createOrganizationMember).toHaveBeenCalledWith({
      organization_id: 'org-uuid-123',
      user_id: 'user-uuid-123',
      role: 'admin',
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockOrg);
  });

  it('should return 400 if name is missing or empty', async () => {
    mockReq.body = { name: '' };

    await addOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing name' });
    expect(organizationService.createOrganization).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await addOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(organizationService.createOrganization).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (organizationService.createOrganization as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});