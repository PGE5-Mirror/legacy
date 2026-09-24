import express from 'express';
import request from 'supertest';
import getItems from '../../src/routes/getItems';
import * as taskService from '../../src/services/TaskService';

jest.mock('../../src/services/TaskService');

const app = express();
app.use(express.json());
app.get('/items', getItems);

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