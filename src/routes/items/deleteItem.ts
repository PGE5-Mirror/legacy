import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { removeItem, getItemById } from '../../services/items.service';

export default async function deleteItemController(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            return res.status(404).json({ error: 'Missing id' });
        }

        const existing = await getItemById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (existing.userId && existing.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await removeItem(id);
        return res.sendStatus(204);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}