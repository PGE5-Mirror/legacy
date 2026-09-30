import * as db from '../persistence';
import { v4 as uuid } from 'uuid';

interface NotificationData {
  id?: string;
  userId: string;
  message: string;
  read?: boolean;
  createdAt?: Date;
}

async function createNotification(data: NotificationData) {
  const notification = {
    id: uuid(),
    userId: data.userId,
    message: data.message,
  };
  return await db.createNotification(notification);
}

async function getNotificationsByUserId(userId: string) {
  return await db.getNotificationsByUserId(userId);
}

export { createNotification, getNotificationsByUserId };
