import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import updateProjectController from '../../../src/server/routes/projects/updateProject';
import * as projectsService from '../../../src/server/services/projects.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/services/projects.service', () => ({
  getProjectById: jest.fn(),
  updateProject: jest.fn(),
}));

describe('updateProjectController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'project-uuid-123' },
      body: { name: 'Updated Project Name' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
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

    (projectsService.getProjectById as jest.Mock)
      .mockResolvedValueOnce(existingProject)
      .mockResolvedValueOnce(updatedProject);
    (projectsService.updateProject as jest.Mock).mockResolvedValue(undefined);

    await updateProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(projectsService.getProjectById).toHaveBeenCalledWith('project-uuid-123');
    expect(projectsService.updateProject).toHaveBeenCalledWith('project-uuid-123', { name: 'Updated Project Name' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedProject);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await updateProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(projectsService.getProjectById).not.toHaveBeenCalled();
  });

  it('should return 404 if the project does not exist', async () => {
    (projectsService.getProjectById as jest.Mock).mockResolvedValue(undefined);

    await updateProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(projectsService.getProjectById).toHaveBeenCalledWith('project-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Project with id project-uuid-123 not found' });
    expect(projectsService.updateProject).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (projectsService.getProjectById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Database error' });
  });
});