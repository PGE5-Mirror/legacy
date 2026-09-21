import { Request, Response } from 'express';
import * as taskService from '../services/TaskService';

export default async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await taskService.getAllTasks();
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};