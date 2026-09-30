import request from 'supertest';
import express from 'express';
import router from '../../../src/server/routes/organizations.routes';
import getOrganizationsController from '../../../src/server/routes/organizations/getOrganizations';
import addOrganizationController from '../../../src/server/routes/organizations/addOrganization';
import updateOrganizationController from '../../../src/server/routes/organizations/updateOrganization';
import deleteOrganizationController from '../../../src/server/routes/organizations/deleteOrganization';

jest.mock('../../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../../src/server/routes/organizations/getOrganizations');
jest.mock('../../../src/server/routes/organizations/addOrganization');
jest.mock('../../../src/server/routes/organizations/updateOrganization');
jest.mock('../../../src/server/routes/organizations/deleteOrganization');

const app = express();
app.use(express.json());
app.use(router);

describe('organizations.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /organizations should call getOrganizationsController and return 200', async () => {
    (getOrganizationsController as jest.Mock).mockImplementation((req, res) => {
      return res.status(200).json([{ id: 'org-1', name: 'Org 1' }]);
    });

    const response = await request(app).get('/organizations');

    expect(getOrganizationsController).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'org-1', name: 'Org 1' }]);
  });

  it('POST /organizations should call addOrganizationController and return 201', async () => {
    (addOrganizationController as jest.Mock).mockImplementation((req, res) => {
      return res.status(201).json({ id: 'org-1', name: 'Org 1' });
    });

    const response = await request(app)
      .post('/organizations')
      .send({ name: 'Org 1' });

    expect(addOrganizationController).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'org-1', name: 'Org 1' });
  });

  it('PUT /organizations/:id should call updateOrganizationController and return 200', async () => {
    (updateOrganizationController as jest.Mock).mockImplementation((req, res) => {
      return res.status(200).json({ id: req.params.id, name: 'Updated Org' });
    });

    const response = await request(app)
      .put('/organizations/org-1')
      .send({ name: 'Updated Org' });

    expect(updateOrganizationController).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'org-1', name: 'Updated Org' });
  });

  it('DELETE /organizations/:id should call deleteOrganizationController and return 204', async () => {
    (deleteOrganizationController as jest.Mock).mockImplementation((req, res) => {
      return res.status(204).send();
    });

    const response = await request(app).delete('/organizations/org-1');

    expect(deleteOrganizationController).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });
});