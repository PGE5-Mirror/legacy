import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import getProjectsController from '../../../../src/server/routes/projects/getProjects';
import * as projectsService from '../../../../src/server/services/projects.service';
import * as organizationMembersService from '../../../../src/server/services/organizationMembers.service';
import { createStandardControllerMocks } from '../../mockupUtils';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/projects.service', () => ({
  getProjects: jest.fn(),
}));

jest.mock('../../../../src/server/services/organizationMembers.service', () => ({
  getOrganizationMemberByOrganizationId: jest.fn(),
}));

describe('getProjectsController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mocks = createStandardControllerMocks({
      params: { id: 'org-uuid-123' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    });

    mockReq = mocks.mockReq;
    mockRes = mocks.mockRes;
  });

  it('should retrieve projects successfully and return status 200', async () => {
    const mockProjects = [{ id: 'project-1', name: 'Project 1', organization_id: 'org-uuid-123' }];
    const mockMembers = [{ user_id: 'user-uuid-123' }];

    (organizationMembersService.getOrganizationMemberByOrganizationId as jest.Mock).mockResolvedValue(mockMembers);
    (projectsService.getProjects as jest.Mock).mockResolvedValue(mockProjects);

    await getProjectsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationMembersService.getOrganizationMemberByOrganizationId).toHaveBeenCalledWith('org-uuid-123');
    expect(projectsService.getProjects).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await getProjectsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(projectsService.getProjects).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not a member of the organization', async () => {
    (organizationMembersService.getOrganizationMemberByOrganizationId as jest.Mock).mockResolvedValue([]);

    await getProjectsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(organizationMembersService.getOrganizationMemberByOrganizationId).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(projectsService.getProjects).not.toHaveBeenCalled();
  });

  it('should return an empty array if no projects are returned', async () => {
    const mockMembers = [{ user_id: 'user-uuid-123' }];

    (organizationMembersService.getOrganizationMemberByOrganizationId as jest.Mock).mockResolvedValue(mockMembers);
    (projectsService.getProjects as jest.Mock).mockResolvedValue(null);

    await getProjectsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(projectsService.getProjects).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 if an error occurs', async () => {
    const mockMembers = [{ user_id: 'user-uuid-123' }];

    (organizationMembersService.getOrganizationMemberByOrganizationId as jest.Mock).mockResolvedValue(mockMembers);
    (projectsService.getProjects as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getProjectsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});