import { Response } from 'express';
import getOrganizationsController from '../../../src/server/routes/getOrganizations';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getOrganizations: jest.fn(),
}));

describe('getOrganizationsController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {};

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve organizations successfully and return status 200', async () => {
    const mockOrganizations = [{ id: 'org-uuid-123', name: 'Test Org' }];

    (db.getOrganizations as jest.Mock).mockResolvedValue(mockOrganizations);

    await getOrganizationsController(mockReq, mockRes as Response);

    expect(db.getOrganizations).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockOrganizations);
  });

  it('should return an empty array if no organizations are returned', async () => {
    (db.getOrganizations as jest.Mock).mockResolvedValue(null);

    await getOrganizationsController(mockReq, mockRes as Response);

    expect(db.getOrganizations).toHaveBeenCalledTimes(1);
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