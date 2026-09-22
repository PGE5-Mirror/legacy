import { Request, Response } from 'express';
import * as db from '../../persistence';

export default async function deleteItem(req: Request, res: Response): Promise<Response | void> {
    try {
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            return res.status(404).json({ error: 'Missing id' });
        }

        const existing = await db.getItem(id);
        if (!existing) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await db.removeItem(id);
        return res.sendStatus(204);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
