import request from 'supertest';
import express from 'express';
import itemsRouter from '../../src/server/routes/items.routes';
import { verifyToken } from '../../src/server/middlewares/auth.middleware';
import getItemsController from '../../src/server/routes/items/getItems';
import addItemController from '../../src/server/routes/items/addItem';
import updateItemController from '../../src/server/routes/items/updateItem';
import deleteItemController from '../../src/server/routes/items/deleteItem';

jest.mock('../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => next()),
}));

jest.mock('../../src/server/routes/items/getItems', () => jest.fn((req, res) => res.status(200).json([])));
jest.mock('../../src/server/routes/items/addItem', () => jest.fn((req, res) => res.status(201).json({ id: 'item-1', name: 'Test Item' })));
jest.mock('../../src/server/routes/items/updateItem', () => jest.fn((req, res) => res.status(200).json({ id: req.params.id, name: 'Updated Item' })));
jest.mock('../../src/server/routes/items/deleteItem', () => jest.fn((req, res) => res.sendStatus(204)));

const app = express();
app.use(express.json());
app.use('/', itemsRouter);

describe('Items Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /items should call verifyToken and getItemsController, then return 200', async () => {
    const response = await request(app).get('/items');
    expect(response.status).toBe(200);
    expect(verifyToken).toHaveBeenCalled();
    expect(getItemsController).toHaveBeenCalled();
  });

  it('POST /items should call verifyToken and addItemController, then return 201', async () => {
    const response = await request(app).post('/items').send({ name: 'Test Item' });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'item-1', name: 'Test Item' });
    expect(verifyToken).toHaveBeenCalled();
    expect(addItemController).toHaveBeenCalled();
  });

  it('PUT /items/:id should call verifyToken and updateItemController, then return 200', async () => {
    const response = await request(app).put('/items/item-1').send({ name: 'Updated Item' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'item-1', name: 'Updated Item' });
    expect(verifyToken).toHaveBeenCalled();
    expect(updateItemController).toHaveBeenCalled();
  });

  it('DELETE /items/:id should call verifyToken and deleteItemController, then return 204', async () => {
    const response = await request(app).delete('/items/item-1');
    expect(response.status).toBe(204);
    expect(verifyToken).toHaveBeenCalled();
    expect(deleteItemController).toHaveBeenCalled();
  });
});