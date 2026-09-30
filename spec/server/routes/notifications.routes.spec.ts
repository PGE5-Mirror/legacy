import request from 'supertest';
import express from 'express';
import router from '../../../src/server/routes/notifications.routes';
import * as notificationsService from '../../../src/server/services/notifications.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../../src/server/services/notifications.service', () => ({
  getNotificationsByUserId: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(router);

describe('notifications.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /notifications should call getNotificationsController and return 200', async () => {
    const mockNotifications = [{ id: 'notif-1', user_id: 'user-uuid-123', message: 'Test notification' }];
    (notificationsService.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockNotifications);

    const response = await request(app).get('/notifications');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNotifications);
  });
});