import { Response } from 'express';
import addProjectController from '../../../src/server/routes/addProject';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  storeProject: jest.fn(),
}));

describe('addProjectController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
      body: { name: 'New Project' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should create a project successfully and return status 201', async () => {
    const mockProject = { id: 'project-uuid-123', name: 'New Project', organization_id: 'org-uuid-123' };

    (db.storeProject as jest.Mock).mockResolvedValue(mockProject);

    await addProjectController(mockReq, mockRes as Response);

    expect(db.storeProject).toHaveBeenCalledWith({
      name: 'New Project',
      organization_id: 'org-uuid-123',
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockProject);
  });

  it('should return 400 if name is missing or empty', async () => {
    mockReq.body = { name: '' };

    await addProjectController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing name' });
    expect(db.storeProject).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.storeProject as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addProjectController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.any(Error));
  });
});