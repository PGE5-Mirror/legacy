import { Request, Response } from 'express';
import { updateItem, getItemById } from '../../services/items.service';

export default async function updateItemController(req: Request, res: Response): Promise<Response> {
    try {
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        const { name, completed } = req.body;

        const existing = await getItemById(id);
        if (!existing) {
            return res.status(404).json({ message: `Item with id ${id} not found` });
        }

        const updateData = {
            name: name,
            completed: completed,
        };

        await updateItem(updateData);
        const item = await getItemById(id);
        return res.status(200).json(item);
    } catch (err: any) {
        return res.status(500).send({ error: err.message });
    }
};
