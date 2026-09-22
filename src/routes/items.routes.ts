import { Router } from 'express';
import getItemsController from './items/getItems';
import addItemController from './items/addItem';
import updateItemController from './items/updateItem';
import deleteItemController from './items/deleteItem';

const router = Router();

router.get('/items', getItemsController);
router.post('/items', addItemController);
router.put('/items/:id', updateItemController);
router.delete('/items/:id', deleteItemController);

export default router;
