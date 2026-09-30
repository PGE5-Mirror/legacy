import request from 'supertest';
import express from 'express';
import router from '../../../src/server/routes/projects.routes';
import getProjectsController from '../../../src/server/routes/projects/getProjects';
import addProjectController from '../../../src/server/routes/projects/addProject';
import updateProjectController from '../../../src/server/routes/projects/updateProject';
import deleteProjectController from '../../../src/server/routes/projects/deleteProject';

jest.mock('../../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../../src/server/routes/projects/getProjects');
jest.mock('../../../src/server/routes/projects/addProject');
jest.mock('../../../src/server/routes/projects/updateProject');
jest.mock('../../../src/server/routes/projects/deleteProject');

const app = express();
app.use(express.json());
app.use(router);

describe('projects.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /projects/:id should call updateProjectController and return 200', async () => {
    (updateProjectController as jest.Mock).mockImplementation((req, res) => {
      return res.status(200).json({ id: req.params.id, name: 'Updated Project' });
    });

    const response = await request(app)
      .put('/projects/proj-1')
      .send({ name: 'Updated Project' });

    expect(updateProjectController).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'proj-1', name: 'Updated Project' });
  });

  it('DELETE /projects/:id should call deleteProjectController and return 204', async () => {
    (deleteProjectController as jest.Mock).mockImplementation((req, res) => {
      return res.status(204).send();
    });

    const response = await request(app).delete('/projects/proj-1');

    expect(deleteProjectController).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });

  it('GET /organizations/:id/projects should call getProjectsController and return 200', async () => {
    (getProjectsController as jest.Mock).mockImplementation((req, res) => {
      return res.status(200).json([{ id: 'proj-1', name: 'Project 1', organization_id: req.params.id }]);
    });

    const response = await request(app).get('/organizations/org-1/projects');

    expect(getProjectsController).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'proj-1', name: 'Project 1', organization_id: 'org-1' }]);
  });

  it('POST /organizations/:id/projects should call addProjectController and return 201', async () => {
    (addProjectController as jest.Mock).mockImplementation((req, res) => {
      return res.status(201).json({ id: 'proj-1', name: 'Project 1', organization_id: req.params.id });
    });

    const response = await request(app)
      .post('/organizations/org-1/projects')
      .send({ name: 'Project 1' });

    expect(addProjectController).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'proj-1', name: 'Project 1', organization_id: 'org-1' });
  });
});