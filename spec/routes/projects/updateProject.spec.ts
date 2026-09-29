import { Request, Response } from 'express';
import updateProjectController from '../../../src/server/routes/updateProject';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getProject: jest.fn(),
  updateProject: jest.fn(),
}));

describe('updateProjectController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'project-uuid-123' },
      body: { name: 'Updated Project Name' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('should update the project successfully and return status 200', async () => {
    const existingProject = { id: 'project-uuid-123', name: 'Old Name' };
    const updatedProject = { id: 'project-uuid-123', name: 'Updated Project Name' };

    (db.getProject as jest.Mock)
      .mockResolvedValueOnce(existingProject)
      .mockResolvedValueOnce(updatedProject);
    (db.updateProject as jest.Mock).mockResolvedValue(undefined);

    await updateProjectController(mockReq as Request<{ id: string }>, mockRes as Response);

    expect(db.getProject).toHaveBeenCalledWith('project-uuid-123');
    expect(db.updateProject).toHaveBeenCalledWith('project-uuid-123', { name: 'Updated Project Name' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedProject);
  });

  it('should return 404 if the project does not exist', async () => {
    (db.getProject as jest.Mock).mockResolvedValue(undefined);

    await updateProjectController(mockReq as Request<{ id: string }>, mockRes as Response);

    expect(db.getProject).toHaveBeenCalledWith('project-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Project with id project-uuid-123 not found' });
    expect(db.updateProject).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.getProject as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateProjectController(mockReq as Request<{ id: string }>, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Database error' });
  });
});