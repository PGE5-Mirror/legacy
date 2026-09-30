import request from 'supertest';
import express from 'express';
import router from '../../../src/server/routes/organizationMembers.routes';
import getOrganizationMembersController from '../../../src/server/routes/organizationMembers/getOrganizationMembers';
import addOrganizationMemberController from '../../../src/server/routes/organizationMembers/addOrganizationMember';
import deleteOrganizationMemberController from '../../../src/server/routes/organizationMembers/deleteOrganizationMember';

jest.mock('../../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../../src/server/routes/organizationMembers/getOrganizationMembers');
jest.mock('../../../src/server/routes/organizationMembers/addOrganizationMember');
jest.mock('../../../src/server/routes/organizationMembers/deleteOrganizationMember');

const app = express();
app.use(express.json());
app.use(router);

describe('organizationMembers.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /organizations/:id/members should call getOrganizationMembersController and return 200', async () => {
    (getOrganizationMembersController as jest.Mock).mockImplementation((req, res) => {
      return res.status(200).json([{ id: 'member-1', user_id: 'user-1', organization_id: req.params.id, role: 'member' }]);
    });

    const response = await request(app).get('/organizations/org-1/members');

    expect(getOrganizationMembersController).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'member-1', user_id: 'user-1', organization_id: 'org-1', role: 'member' }]);
  });

  it('POST /organizations/:id/members should call addOrganizationMemberController and return 201', async () => {
    (addOrganizationMemberController as jest.Mock).mockImplementation((req, res) => {
      return res.status(201).json({ id: 'member-1', user_id: req.body.added_user_id, organization_id: req.params.id, role: req.body.role });
    });

    const response = await request(app)
      .post('/organizations/org-1/members')
      .send({ added_user_id: 'user-1', role: 'member' });

    expect(addOrganizationMemberController).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'member-1', user_id: 'user-1', organization_id: 'org-1', role: 'member' });
  });

  it('DELETE /organizations/:id/members/:memberId should call deleteOrganizationMemberController and return 204', async () => {
    (deleteOrganizationMemberController as jest.Mock).mockImplementation((req, res) => {
      return res.status(204).send();
    });

    const response = await request(app).delete('/organizations/org-1/members/member-1');

    expect(deleteOrganizationMemberController).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });
});