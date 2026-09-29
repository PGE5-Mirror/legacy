import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getUserSettingsController from './userSettings/getUserSettings';
import updateUserSettingsController from './userSettings/updateUserSettings';

const router = Router();

router.get('/users/me/settings', verifyToken, getUserSettingsController);
router.put('/users/me/settings', verifyToken, updateUserSettingsController);

export default router;
