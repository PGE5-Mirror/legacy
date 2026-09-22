import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getItemsController from './items/getItems';
import addItemController from './items/addItem';
import updateItemController from './items/updateItem';
import deleteItemController from './items/deleteItem';

const router = Router();

router.get('/items', verifyToken, getItemsController);
router.post('/items', verifyToken, addItemController);
router.put('/items/:id', verifyToken, updateItemController);
router.delete('/items/:id', verifyToken, deleteItemController);

export default router;
