import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import updateOrganizationController from '../../../src/server/routes/organizations/updateOrganization';
import * as organizationService from '../../../src/server/services/organization.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/services/organization.service', () => ({
  getOrganizationById: jest.fn(),
  updateOrganization: jest.fn(),
}));

describe('updateOrganizationController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
      body: { name: 'Updated Organization Name' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('should update the organization successfully and return status 200', async () => {
    const existingOrg = { id: 'org-uuid-123', name: 'Old Name' };
    const updatedOrg = { id: 'org-uuid-123', name: 'Updated Organization Name' };

    (organizationService.getOrganizationById as jest.Mock)
      .mockResolvedValueOnce(existingOrg)
      .mockResolvedValueOnce(updatedOrg);
    (organizationService.updateOrganization as jest.Mock).mockResolvedValue(undefined);

    await updateOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationService.getOrganizationById).toHaveBeenCalledWith('org-uuid-123');
    expect(organizationService.updateOrganization).toHaveBeenCalledWith('org-uuid-123', { name: 'Updated Organization Name' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedOrg);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await updateOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(organizationService.getOrganizationById).not.toHaveBeenCalled();
  });

  it('should return 404 if the organization does not exist', async () => {
    (organizationService.getOrganizationById as jest.Mock).mockResolvedValue(undefined);

    await updateOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationService.getOrganizationById).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Organization with id org-uuid-123 not found' });
    expect(organizationService.updateOrganization).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (organizationService.getOrganizationById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Database error' });
  });
});