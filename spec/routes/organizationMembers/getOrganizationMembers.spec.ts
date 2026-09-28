import { Response } from 'express';
import getOrganizationMembersController from '../../../src/server/routes/getOrganizationMembers';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getOrganizationMembers: jest.fn(),
}));

describe('getOrganizationMembersController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve organization members successfully and return status 200', async () => {
    const mockMembers = [{ id: 'member-1', organization_id: 'org-uuid-123', user_id: 'user-1' }];

    (db.getOrganizationMembers as jest.Mock).mockResolvedValue(mockMembers);

    await getOrganizationMembersController(mockReq, mockRes as Response);

    expect(db.getOrganizationMembers).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockMembers);
  });

  it('should return an empty array if no members are returned', async () => {
    (db.getOrganizationMembers as jest.Mock).mockResolvedValue(null);

    await getOrganizationMembersController(mockReq, mockRes as Response);

    expect(db.getOrganizationMembers).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 if an error occurs', async () => {
    (db.getOrganizationMembers as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getOrganizationMembersController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});