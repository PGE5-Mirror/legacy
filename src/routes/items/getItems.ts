import { Request, Response } from 'express';
import { getItems } from '../../services/items.service';

export default async function getItemsController(req: Request, res: Response): Promise<Response> {
    try {
        const items = await getItems();
        return res.status(200).json(items || []);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};
