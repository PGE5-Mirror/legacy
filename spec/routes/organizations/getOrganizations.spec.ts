import { Response } from 'express';
import getOrganizationsController from '../../../src/server/routes/organizations/getOrganizations';
import * as db from '../../../src/server/persistence';
import * as organizationMembersService from '../../../src/server/services/organizationMembers.service';

jest.mock('../../../src/server/persistence', () => ({
  getOrganizations: jest.fn(),
}));

jest.mock('../../../src/server/services/organizationMembers.service', () => ({
  getOrganizationMemberByOrganizationId: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

describe('getOrganizationsController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-uuid-123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await getOrganizationsController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should retrieve organizations successfully where user is a member and return status 200', async () => {
    const mockOrganizations = [
      { id: 'org-uuid-123', name: 'Test Org' },
      { id: 'org-uuid-456', name: 'Other Org' },
    ];
    const mockMembers = [{ user_id: 'user-uuid-123' }];

    (db.getOrganizations as jest.Mock).mockResolvedValue(mockOrganizations);
    
    (organizationMembersService.getOrganizationMemberByOrganizationId as jest.Mock)
      .mockResolvedValueOnce(mockMembers)
      .mockResolvedValueOnce([]);

    await getOrganizationsController(mockReq, mockRes as Response);

    expect(db.getOrganizations).toHaveBeenCalledTimes(1);
    expect(organizationMembersService.getOrganizationMemberByOrganizationId).toHaveBeenCalledTimes(2);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([{ id: 'org-uuid-123', name: 'Test Org' }]);
  });

  it('should return an empty array if user has no matching organizations', async () => {
    const mockOrganizations = [{ id: 'org-uuid-123', name: 'Test Org' }];

    (db.getOrganizations as jest.Mock).mockResolvedValue(mockOrganizations);
    (organizationMembersService.getOrganizationMemberByOrganizationId as jest.Mock).mockResolvedValue([]);

    await getOrganizationsController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 if an error occurs', async () => {
    (db.getOrganizations as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getOrganizationsController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});