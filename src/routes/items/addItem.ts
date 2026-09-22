import { Request, Response } from 'express';
import * as db from '../../persistence';
import { publishEvent } from '../../events/rabbitmq';

export default async function addItem(req: Request, res: Response): Promise<Response | void> {
    try {
        const { name } = req.body;

        if (!name || name.trim().length < 1) {
            return res.status(400).json({ error: 'Missing title' });
        }

        const createdTask = await db.storeItem({ name: name });

        try {
            await publishEvent('TaskCreated', { taskId: createdTask.id, name: createdTask.name });
        } catch (err) {
            console.error('Failed to publish TaskCreated event:', err);
        }

        return res.status(201).json(createdTask);
    } catch (err) {
        return res.status(500).json(err);
    }
};
