import express from 'express';
import request from 'supertest';
import getItems from '../../src/routes/getItems';
import * as taskService from '../../src/services/TaskService';

jest.mock('../../src/services/TaskService');

const app = express();
app.use(express.json());
app.get('/items', getItems);
beforeEach(() => {
    jest.clearAllMocks();
});

test('it gets items correctly', async () => {
    const req = {};
    const res = { send: jest.fn() };
    db.getItems.mockReturnValue(Promise.resolve(ITEMS));

describe('GET /items', () => {
    it('returns 200 and an array of items on happy path', async () => {
        const tasks = [{ id: '1', name: 'Task 1', completed: false }];
        (taskService.getAllTasks as jest.Mock).mockResolvedValue(tasks);

        const res = await request(app).get('/items');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(tasks);
    });

    it('returns 200 and an empty array as fallback if no items exist', async () => {
        (taskService.getAllTasks as jest.Mock).mockResolvedValue([]);

        const res = await request(app).get('/items');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('returns 500 on failure', async () => {
        (taskService.getAllTasks as jest.Mock).mockRejectedValue(new Error('DB Error'));

        const res = await request(app).get('/items');
        expect(res.status).toBe(500);
    });
});
    expect(db.getItems.mock.calls.length).toBe(1);
    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(ITEMS);
});

test('it returns an empty array when there are no items', async () => {
    const req = {};
    const res = { send: jest.fn() };
    db.getItems.mockReturnValue(Promise.resolve([]));

    await getItems(req, res);

    expect(res.send.mock.calls[0][0]).toEqual([]);
});

test('it handles a large number of items', async () => {
    const req = {};
    const res = { send: jest.fn() };
    const manyItems = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
    db.getItems.mockReturnValue(Promise.resolve(manyItems));

    await getItems(req, res);

    expect(res.send.mock.calls[0][0]).toHaveLength(1000);
});

test('it propagates an error when the persistence layer fails', async () => {
    const req = {};
    const res = { send: jest.fn() };
    db.getItems.mockReturnValue(Promise.reject(new Error('read failure')));

    await expect(getItems(req, res)).rejects.toThrow('read failure');
    expect(res.send).not.toHaveBeenCalled();
});
