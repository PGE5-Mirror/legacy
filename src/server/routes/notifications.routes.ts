import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getNotificationsController from './notifications/getNotifications';

const router = Router();

router.get('/notifications', verifyToken, getNotificationsController);

export default router;
