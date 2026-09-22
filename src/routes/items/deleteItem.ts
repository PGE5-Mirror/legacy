import { Request, Response } from 'express';
import { removeItem, getItemById } from '../../services/items.service';

export default async function deleteItemController(req: Request, res: Response): Promise<Response | void> {
    try {
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            return res.status(404).json({ error: 'Missing id' });
        }

        const existing = await getItemById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await removeItem(id);
        return res.sendStatus(204);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
