import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getColumnsController from './columns/getColumns';
import addColumnController from './columns/addColumn';
import updateColumnController from './columns/updateColumn';
import deleteColumnController from './columns/deleteColumn';

const router = Router();

router.get('/columns', verifyToken, getColumnsController);
router.post('/columns', verifyToken, addColumnController);
router.put('/columns/:id', verifyToken, updateColumnController);
router.delete('/columns/:id', verifyToken, deleteColumnController);

export default router;
