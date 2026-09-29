import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import addProjectController from '../../../../src/server/routes/projects/addProject';
import * as projectsService from '../../../../src/server/services/projects.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/projects.service', () => ({
  createProject: jest.fn(),
}));

describe('addProjectController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
      body: { name: 'New Project' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should create a project successfully and return status 201', async () => {
    const mockProject = { id: 'project-uuid-123', name: 'New Project', organization_id: 'org-uuid-123' };

    (projectsService.createProject as jest.Mock).mockResolvedValue(mockProject);

    await addProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(projectsService.createProject).toHaveBeenCalledWith({
      name: 'New Project',
      organization_id: 'org-uuid-123',
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockProject);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await addProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(projectsService.createProject).not.toHaveBeenCalled();
  });

  it('should return 400 if name is missing or empty', async () => {
    mockReq.body = { name: '' };

    await addProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing name' });
    expect(projectsService.createProject).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (projectsService.createProject as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});