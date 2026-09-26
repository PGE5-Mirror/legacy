import { Request, Response } from 'express';
import * as taskService from '../services/TaskService';

export default async (req: Request, res: Response): Promise<void> => {
    try {
        await taskService.removeTask(req.params.id as string);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};