import request from 'supertest';
import express from 'express';
import router from '../../../src/server/routes/projects.routes';
import * as projectsService from '../../../src/server/services/projects.service';
import * as organizationMembersService from '../../../src/server/services/organizationMembers.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../../src/server/services/projects.service', () => ({
  getProjects: jest.fn(),
  getProjectById: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  removeProject: jest.fn(),
}));

jest.mock('../../../src/server/services/organizationMembers.service', () => ({
  getOrganizationMemberByOrganizationId: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(router);

describe('projects.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /organizations/:id/projects should call getProjectsController and return 200', async () => {
    const mockMembers = [{ user_id: 'user-uuid-123', organization_id: 'org-1' }];
    const mockProjects = [{ id: 'proj-1', name: 'Project 1', organization_id: 'org-1' }];
    (organizationMembersService.getOrganizationMemberByOrganizationId as jest.Mock).mockResolvedValue(mockMembers);
    (projectsService.getProjects as jest.Mock).mockResolvedValue(mockProjects);

    const response = await request(app).get('/organizations/org-1/projects');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProjects);
  });

  it('POST /organizations/:id/projects should call addProjectController and return 201', async () => {
    const mockProject = { id: 'proj-1', name: 'Project 1', organization_id: 'org-1' };
    (projectsService.createProject as jest.Mock).mockResolvedValue(mockProject);

    const response = await request(app)
      .post('/organizations/org-1/projects')
      .send({ name: 'Project 1' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockProject);
  });

  it('PUT /projects/:id should call updateProjectController and return 200', async () => {
    const mockProject = { id: 'proj-1', name: 'Updated Project' };
    (projectsService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
    (projectsService.updateProject as jest.Mock).mockResolvedValue(mockProject);

    const response = await request(app)
      .put('/projects/proj-1')
      .send({ name: 'Updated Project' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProject);
  });

  it('DELETE /projects/:id should call deleteProjectController and return 204', async () => {
    const mockProject = { id: 'proj-1', name: 'Project 1' };
    (projectsService.getProjectById as jest.Mock).mockResolvedValue(mockProject);
    (projectsService.removeProject as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete('/projects/proj-1');

    expect(response.status).toBe(204);
  });
});