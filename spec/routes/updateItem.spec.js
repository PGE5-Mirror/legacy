import express from 'express';
import request from 'supertest';
import updateItem from '../../src/routes/updateItem';
import * as taskService from '../../src/services/TaskService';

jest.mock('../../src/services/TaskService');

const app = express();
app.use(express.json());
app.put('/items/:id', updateItem);

describe('PUT /items/:id', () => {
    it('returns 200 and the updated item on happy path', async () => {
        const updatedTask = { id: '1', name: 'Updated', completed: true };
        (taskService.updateTask as jest.Mock).mockResolvedValue(updatedTask);

        const res = await request(app).put('/items/1').send({ name: 'Updated', completed: true });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(updatedTask);
    });

    it('returns 404 if the item is missing', async () => {
        (taskService.updateTask as jest.Mock).mockResolvedValue(undefined);

        const res = await request(app).put('/items/999').send({ name: 'Updated', completed: true });
        expect(res.status).toBe(404);
    });

    it('returns 500 on failure', async () => {
        (taskService.updateTask as jest.Mock).mockRejectedValue(new Error('DB Error'));

        const res = await request(app).put('/items/1').send({ name: 'Updated', completed: true });
        expect(res.status).toBe(500);
    });
});