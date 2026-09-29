import * as notificationsService from '../../src/server/services/notifications.service';
import * as db from '../../src/server/persistence';

jest.mock('uuid', () => ({
  v4: () => 'notification-uuid-123',
}));

jest.mock('../../src/server/persistence', () => ({
  createNotification: jest.fn(),
  getNotificationsByUserId: jest.fn(),
}));

describe('notifications.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create and store a notification successfully', async () => {
      const notificationData = { userId: 'user-1', message: 'Test notification' };
      const storedNotification = { id: 'notification-uuid-123', userId: 'user-1', message: 'Test notification' };

      (db.createNotification as jest.Mock).mockResolvedValue(storedNotification);

      const result = await notificationsService.createNotification(notificationData);

      expect(db.createNotification).toHaveBeenCalledWith({
        id: 'notification-uuid-123',
        userId: 'user-1',
        message: 'Test notification',
      });
      expect(result).toEqual(storedNotification);
    });
  });

  describe('getNotificationsByUserId', () => {
    it('should retrieve notifications by user id', async () => {
      const mockNotifications = [{ id: 'notification-uuid-123', userId: 'user-1', message: 'Test notification' }];

      (db.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await notificationsService.getNotificationsByUserId('user-1');

      expect(db.getNotificationsByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockNotifications);
    });
  });
});