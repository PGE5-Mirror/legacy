import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import deleteProjectController from '../../../../src/server/routes/projects/deleteProject';
import * as projectsService from '../../../../src/server/services/projects.service';
import * as organizationService from '../../../../src/server/services/organization.service';
import { createStandardControllerMocks } from '../../mockupUtils';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/projects.service', () => ({
  getProjectById: jest.fn(),
  removeProject: jest.fn(),
}));

jest.mock('../../../../src/server/services/organization.service', () => ({
  isOrganizationAdmin: jest.fn(),
}));

describe('deleteProjectController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mocks = createStandardControllerMocks({
      params: { id: 'project-uuid-123' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    });

    mockReq = mocks.mockReq;
    mockRes = mocks.mockRes;
  });

  it('should delete the project successfully and return status 204', async () => {
    const mockProject = { id: 'project-uuid-123', name: 'Test Project', organization_id: 'org-uuid-123' };

    (projectsService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
    (organizationService.isOrganizationAdmin as jest.Mock).mockResolvedValue(true);
    (projectsService.removeProject as jest.Mock).mockResolvedValue(undefined);

    await deleteProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(projectsService.getProjectById).toHaveBeenCalledWith('project-uuid-123');
    expect(organizationService.isOrganizationAdmin).toHaveBeenCalledWith('org-uuid-123', 'user-uuid-123');
    expect(projectsService.removeProject).toHaveBeenCalledWith('project-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await deleteProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(projectsService.getProjectById).not.toHaveBeenCalled();
  });

  it('should return 400 if id is missing', async () => {
    mockReq.params = { id: '' };

    await deleteProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(projectsService.getProjectById).not.toHaveBeenCalled();
  });

  it('should return 404 if the project does not exist', async () => {
    (projectsService.getProjectById as jest.Mock).mockResolvedValue(undefined);

    await deleteProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(projectsService.getProjectById).toHaveBeenCalledWith('project-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Project not found' });
    expect(projectsService.removeProject).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not an organization admin', async () => {
    const mockProject = { id: 'project-uuid-123', name: 'Test Project', organization_id: 'org-uuid-123' };

    (projectsService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
    (organizationService.isOrganizationAdmin as jest.Mock).mockResolvedValue(false);

    await deleteProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(projectsService.getProjectById).toHaveBeenCalledWith('project-uuid-123');
    expect(organizationService.isOrganizationAdmin).toHaveBeenCalledWith('org-uuid-123', 'user-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Only an organization admin can delete this project' });
    expect(projectsService.removeProject).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (projectsService.getProjectById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteProjectController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});