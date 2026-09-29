import request from 'supertest';
import express from 'express';
import router from '../../src/server/routes/organizationMembers.routes';
import * as organizationMembersService from '../../src/server/services/organizationMembers.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../src/server/services/organizationMembers.service', () => ({
  getOrganizationMemberByOrganizationId: jest.fn(),
  createOrganizationMember: jest.fn(),
  getOrganizationMemberById: jest.fn(),
  removeOrganizationMember: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(router);

describe('organizationMembers.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /organizations/:id/members should call getOrganizationMembersController and return 200', async () => {
    const mockMembers = [{ id: 'member-1', user_id: 'user-1', organization_id: 'org-1', role: 'member' }];
    (organizationMembersService.getOrganizationMemberById as jest.Mock).mockResolvedValue(mockMembers);

    const response = await request(app).get('/organizations/org-1/members');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMembers);
  });

  it('POST /organizations/:id/members should call addOrganizationMemberController and return 201', async () => {
    const mockMember = { id: 'member-1', user_id: 'user-1', organization_id: 'org-1', role: 'member' };
    (organizationMembersService.createOrganizationMember as jest.Mock).mockResolvedValue(mockMember);

    const response = await request(app)
      .post('/organizations/org-1/members')
      .send({ added_user_id: 'user-1', role: 'member' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockMember);
  });

  it('DELETE /organizations/:id/members/:memberId should call deleteOrganizationMemberController and return 204', async () => {
    const mockMember = { id: 'member-1', user_id: 'user-1', organization_id: 'org-1', role: 'member' };
    (organizationMembersService.getOrganizationMemberById as jest.Mock).mockResolvedValue(mockMember);
    (organizationMembersService.removeOrganizationMember as jest.Mock).mockResolvedValue(mockMember);

    const response = await request(app).delete('/organizations/org-1/members/member-1');

    expect(response.status).toBe(204);
  });
});