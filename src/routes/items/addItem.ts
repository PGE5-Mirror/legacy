import { Request, Response } from 'express';
import { publishEvent } from '../../events/rabbitmq';
import { createItem } from '../../services/items.service';

export default async function addItemController(req: Request, res: Response): Promise<Response | void> {
    try {
        const { name } = req.body;

        if (!name || name.trim().length < 1) {
            return res.status(400).json({ error: 'Missing title' });
        }

        const createdTask = await createItem({ name: name});

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
