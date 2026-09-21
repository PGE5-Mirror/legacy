import { Request, Response } from 'express';
import * as taskService from '../services/TaskService';

export default async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { name, completed } = req.body;

        const updatedItem = await taskService.updateTask(id, { name, completed });
        
        if (!updatedItem) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};