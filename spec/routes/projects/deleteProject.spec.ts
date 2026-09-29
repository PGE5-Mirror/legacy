import { Request, Response } from 'express';
import deleteProjectController from '../../../src/server/routes/deleteProject';
import * as db from '../../../src/server/persistence';
import { createStandardControllerMocks } from '../../mockupUtils';

jest.mock('../../../src/server/persistence', () => ({
  getProject: jest.fn(),
  removeProject: jest.fn(),
}));

describe('deleteProjectController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mocks = createStandardControllerMocks({
      params: { id: 'project-uuid-123' },
    });
    mockReq = mocks.mockReq;
    mockRes = mocks.mockRes;
  });

  it('should delete the project successfully and return status 204', async () => {
    const mockProject = { id: 'project-uuid-123', name: 'Test Project' };

    (db.getProject as jest.Mock).mockResolvedValue(mockProject);
    (db.removeProject as jest.Mock).mockResolvedValue(undefined);

    await deleteProjectController(mockReq, mockRes as Response);

    expect(db.getProject).toHaveBeenCalledWith('project-uuid-123');
    expect(db.removeProject).toHaveBeenCalledWith('project-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 404 if id is missing', async () => {
    mockReq.params = { id: '' };

    await deleteProjectController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(db.getProject).not.toHaveBeenCalled();
  });

  it('should return 404 if the project does not exist', async () => {
    (db.getProject as jest.Mock).mockResolvedValue(undefined);

    await deleteProjectController(mockReq, mockRes as Response);

    expect(db.getProject).toHaveBeenCalledWith('project-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Project not found' });
    expect(db.removeProject).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.getProject as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteProjectController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});