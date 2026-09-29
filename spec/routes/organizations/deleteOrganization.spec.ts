import { Response } from 'express';
import deleteOrganizationController from '../../../src/server/routes/deleteOrganization';
import * as db from '../../../src/server/persistence';
import { createStandardControllerMocks } from '../../mockupUtils';

jest.mock('../../../src/server/persistence', () => ({
  getOrganization: jest.fn(),
  removeOrganization: jest.fn(),
}));

describe('deleteOrganizationController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mocks = createStandardControllerMocks(mockReq = {
      params: { id: 'org-uuid-123' },
    });
    mockReq = mocks.mockReq;
    mockRes = mocks.mockRes;
  });

  it('should delete the organization successfully and return status 204', async () => {
    const mockOrg = { id: 'org-uuid-123', name: 'Test Org' };

    (db.getOrganization as jest.Mock).mockResolvedValue(mockOrg);
    (db.removeOrganization as jest.Mock).mockResolvedValue(undefined);

    await deleteOrganizationController(mockReq, mockRes as Response);

    expect(db.getOrganization).toHaveBeenCalledWith('org-uuid-123');
    expect(db.removeOrganization).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 404 if id is missing', async () => {
    mockReq.params = { id: '' };

    await deleteOrganizationController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(db.getOrganization).not.toHaveBeenCalled();
  });

  it('should return 404 if the organization does not exist', async () => {
    (db.getOrganization as jest.Mock).mockResolvedValue(undefined);

    await deleteOrganizationController(mockReq, mockRes as Response);

    expect(db.getOrganization).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Organization not found' });
    expect(db.removeOrganization).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.getOrganization as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteOrganizationController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});