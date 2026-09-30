import request from 'supertest';
import express from 'express';
import router from '../../../src/server/routes/organizations.routes';
import * as organizationsService from '../../../src/server/services/organization.service';
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

jest.mock('../../../src/server/services/organization.service', () => ({
  getOrganizations: jest.fn(),
  getOrganizationById: jest.fn(),
  createOrganization: jest.fn(),
  updateOrganization: jest.fn(),
  removeOrganization: jest.fn(),
}));

jest.mock('../../../src/server/services/organizationMembers.service', () => ({
  createOrganizationMember: jest.fn(),
  getOrganizationMemberByOrganizationId: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(router);

describe('organizations.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /organizations should call getOrganizationsController and return 200', async () => {
    const mockOrganizations = [{ id: 'org-1', name: 'Org 1' }];
    const mockMembers = [{ user_id: 'user-uuid-123', organization_id: 'org-1' }];
    (organizationsService.getOrganizations as jest.Mock).mockResolvedValue(mockOrganizations);
    (organizationMembersService.getOrganizationMemberByOrganizationId as jest.Mock).mockResolvedValue(mockMembers);

    const response = await request(app).get('/organizations');

    expect(organizationsService.getOrganizations).toHaveBeenCalledWith();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrganizations);
  });

  it('POST /organizations should call addOrganizationController and return 201', async () => {
    const mockOrganization = { id: 'org-1', name: 'Org 1' };
    (organizationsService.createOrganization as jest.Mock).mockResolvedValue(mockOrganization);
    (organizationMembersService.createOrganizationMember as jest.Mock).mockResolvedValue({});

    const response = await request(app)
      .post('/organizations')
      .send({ name: 'Org 1' });

    expect(organizationsService.createOrganization).toHaveBeenCalledWith({
      name: 'Org 1',
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrganization);
  });

  it('PUT /organizations/:id should call updateOrganizationController and return 200', async () => {
    const mockOrganization = { id: 'org-1', name: 'Updated Org' };
    (organizationsService.getOrganizationById as jest.Mock).mockResolvedValue(mockOrganization);
    (organizationsService.updateOrganization as jest.Mock).mockResolvedValue(mockOrganization);

    const response = await request(app)
      .put('/organizations/org-1')
      .send({ name: 'Updated Org' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrganization);
  });

  it('DELETE /organizations/:id should call deleteOrganizationController and return 204', async () => {
    const mockOrganization = { id: 'org-1', name: 'Org 1' };
    (organizationsService.getOrganizationById as jest.Mock).mockResolvedValue(mockOrganization);
    (organizationsService.removeOrganization as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete('/organizations/org-1');

    expect(response.status).toBe(204);
  });
});