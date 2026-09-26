import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { publishEvent } from '../../events/rabbitmq';
import { createItem } from '../../services/items.service';

export default async function addItemController(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
        const { name } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!name || name.trim().length < 1) {
            return res.status(400).json({ error: 'Missing title' });
        }

        const createdTask = await createItem({ name, userId });

        try {
            await publishEvent('TaskCreated', { taskId: createdTask.id, name: createdTask.name, userId: createdTask.userId });
        } catch (err) {
            console.error('Failed to publish TaskCreated event:', err);
        }

        return res.status(201).json(createdTask);
    } catch (err) {
        return res.status(500).json(err);
    }
}