import request from 'supertest';
import express from 'express';
import router from '../../src/server/routes/user.routes';
import * as authMiddleware from '../../src/server/middlewares/auth.middleware';
import * as userService from '../../src/server/services/user.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../src/server/services/user.service', () => ({
  getUsers: jest.fn(),
  deleteUser: jest.fn(),
  getUserExportData: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(router);

describe('user.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users should call getUsers and return 200', async () => {
    const mockUsers = [{ id: 'user-1', email: 'user1@example.com' }];
    (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
  });

  it('DELETE /users/me should call deleteAccount and return 204', async () => {
    (userService.deleteUser as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete('/users/me');

    expect(response.status).toBe(204);
  });

  it('GET /users/me/export should call exportUserData and return 200', async () => {
    const mockData = { user: { id: 'user-uuid-123' }, items: [] };
    (userService.getUserExportData as jest.Mock).mockResolvedValue(mockData);

    const response = await request(app).get('/users/me/export');

    expect(response.status).toBe(200);
    expect(response.text).toEqual(JSON.stringify(mockData, null, 2));
  });
});