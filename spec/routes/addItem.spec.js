import express from 'express';
import request from 'supertest';
import addItem from '../../src/routes/addItem';
import * as taskService from '../../src/services/TaskService';
import * as eventBus from '../../src/utils/EventBus'; // Adjust path as needed

jest.mock('../../src/services/TaskService');
jest.mock('../../src/utils/EventBus');

const app = express();
app.use(express.json());
app.post('/items', addItem);

describe('POST /items', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 201, creates a task, and publishes TaskCreated event on happy path', async () => {
        const mockTask = { id: '123', name: 'New Task', completed: false };
        (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);
        (eventBus.publish as jest.Mock).mockResolvedValue(true);

        const res = await request(app).post('/items').send({ name: 'New Task' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(mockTask);
        expect(eventBus.publish).toHaveBeenCalledWith('TaskCreated', mockTask);
    });

    it('returns 400 if name is missing or blank', async () => {
        const res = await request(app).post('/items').send({ name: '   ' });
        expect(res.status).toBe(400);
        expect(taskService.createTask).not.toHaveBeenCalled();
    });

    it('returns 201 even if the event publish fails', async () => {
        const mockTask = { id: '123', name: 'New Task', completed: false };
        (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);
        (eventBus.publish as jest.Mock).mockRejectedValue(new Error('Broker down'));

        const res = await request(app).post('/items').send({ name: 'New Task' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(mockTask);
    });

    it('returns 500 on storage failure', async () => {
        (taskService.createTask as jest.Mock).mockRejectedValue(new Error('DB Error'));

        const res = await request(app).post('/items').send({ name: 'New Task' });
        expect(res.status).toBe(500);
    });
});
