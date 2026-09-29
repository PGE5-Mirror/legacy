import { Response } from 'express';
import updateOrganizationController from '../../../src/server/routes/updateOrganization';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getOrganization: jest.fn(),
  updateOrganization: jest.fn(),
}));

describe('updateOrganizationController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
      body: { name: 'Updated Organization Name' },
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

    (db.getOrganization as jest.Mock)
      .mockResolvedValueOnce(existingOrg)
      .mockResolvedValueOnce(updatedOrg);
    (db.updateOrganization as jest.Mock).mockResolvedValue(undefined);

    await updateOrganizationController(mockReq, mockRes as Response);

    expect(db.getOrganization).toHaveBeenCalledWith('org-uuid-123');
    expect(db.updateOrganization).toHaveBeenCalledWith('org-uuid-123', { name: 'Updated Organization Name' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedOrg);
  });

  it('should return 404 if the organization does not exist', async () => {
    (db.getOrganization as jest.Mock).mockResolvedValue(undefined);

    await updateOrganizationController(mockReq, mockRes as Response);

    expect(db.getOrganization).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Organization with id org-uuid-123 not found' });
    expect(db.updateOrganization).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.getOrganization as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateOrganizationController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Database error' });
  });
});