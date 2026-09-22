import { Router } from 'express';
import getItems from './items/getItems';
import addItem from './items/addItem';
import updateItem from './items/updateItem';
import deleteItem from './items/deleteItem';

const router = Router();

router.get('/items', getItems);
router.post('/items', addItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

export default router;
