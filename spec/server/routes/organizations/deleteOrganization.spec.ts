import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import deleteOrganizationController from '../../../../src/server/routes/organizations/deleteOrganization';
import * as organizationService from '../../../../src/server/services/organization.service';
import { createStandardControllerMocks } from '../../mockupUtils';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/organization.service', () => ({
  getOrganizationById: jest.fn(),
  removeOrganization: jest.fn(),
}));

describe('deleteOrganizationController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mocks = createStandardControllerMocks({
      params: { id: 'org-uuid-123' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    });

    mockReq = mocks.mockReq;
    mockRes = mocks.mockRes;
  });

  it('should delete the organization successfully and return status 204', async () => {
    const mockOrg = { id: 'org-uuid-123', name: 'Test Org' };

    (organizationService.getOrganizationById as jest.Mock).mockResolvedValue(mockOrg);
    (organizationService.removeOrganization as jest.Mock).mockResolvedValue(undefined);

    await deleteOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationService.getOrganizationById).toHaveBeenCalledWith('org-uuid-123');
    expect(organizationService.removeOrganization).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await deleteOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(organizationService.getOrganizationById).not.toHaveBeenCalled();
  });

  it('should return 404 if id is missing', async () => {
    mockReq.params = { id: '' };

    await deleteOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(organizationService.getOrganizationById).not.toHaveBeenCalled();
  });

  it('should return 404 if the organization does not exist', async () => {
    (organizationService.getOrganizationById as jest.Mock).mockResolvedValue(undefined);

    await deleteOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationService.getOrganizationById).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Organization not found' });
    expect(organizationService.removeOrganization).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (organizationService.getOrganizationById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});