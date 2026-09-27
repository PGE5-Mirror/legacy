import { Router } from 'express';
import register from './auth/register';
import login from './auth/login';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
