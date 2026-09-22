import { Request, Response } from 'express';
import * as db from '../../persistence';

export default async function getItems(req: Request, res: Response): Promise<Response> {
    try {
        const items = await db.getItems();
        return res.status(200).json(items || []);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};
