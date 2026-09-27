import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import deleteAccount from './user/DeleteAccount';
import exportUserData from './user/ExportData';

const router = Router();

router.delete('/users/me', verifyToken, deleteAccount);
router.get('/users/me/export', verifyToken, exportUserData);

export default router;
