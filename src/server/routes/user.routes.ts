import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import deleteAccount from './user/DeleteAccount';

const router = Router();

router.delete('/user/me', verifyToken, deleteAccount);

export default router;
