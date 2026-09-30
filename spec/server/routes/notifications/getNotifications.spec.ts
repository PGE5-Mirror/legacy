import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import getNotificationsController from '../../../../src/server/routes/notifications/getNotifications';
import * as notificationsService from '../../../../src/server/services/notifications.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/notifications.service', () => ({
  getNotificationsByUserId: jest.fn(),
}));

describe('getNotificationsController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve notifications successfully and return status 200', async () => {
    const mockNotifications = [{ id: 'notif-1', user_id: 'user-uuid-123', message: 'Test notification' }];

    (notificationsService.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockNotifications);

    await getNotificationsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(notificationsService.getNotificationsByUserId).toHaveBeenCalledWith('user-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockNotifications);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await getNotificationsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(notificationsService.getNotificationsByUserId).not.toHaveBeenCalled();
  });

  it('should return an empty array if no notifications are returned', async () => {
    (notificationsService.getNotificationsByUserId as jest.Mock).mockResolvedValue(null);

    await getNotificationsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(notificationsService.getNotificationsByUserId).toHaveBeenCalledWith('user-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 if an error occurs', async () => {
    (notificationsService.getNotificationsByUserId as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getNotificationsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});