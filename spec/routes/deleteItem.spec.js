import express from 'express';
import request from 'supertest';
import deleteItem from '../../src/routes/deleteItem';
import * as taskService from '../../src/services/TaskService';

jest.mock('../../src/services/TaskService');

const app = express();
app.use(express.json());
app.delete('/items/:id', deleteItem);

describe('DELETE /items/:id', () => {
    it('returns 200 on happy path', async () => {
        (taskService.removeTask as jest.Mock).mockResolvedValue(true);

        const res = await request(app).delete('/items/1');
        expect(res.status).toBe(200);
    });

    it('returns 404 if the item is missing', async () => {
        (taskService.removeTask as jest.Mock).mockResolvedValue(false);

        const res = await request(app).delete('/items/999');
        expect(res.status).toBe(404);
    });

    it('returns 500 on failure', async () => {
        (taskService.removeTask as jest.Mock).mockRejectedValue(new Error('DB Error'));

        const res = await request(app).delete('/items/1');
        expect(res.status).toBe(500);
    });
});
