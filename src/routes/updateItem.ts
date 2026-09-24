import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, completed } = req.body;

    const existing = await db.getItem(id);
    if (!existing) {
      return res.status(404).json({ message: `Item with id ${id} not found` });
    }

    const updateData = { name, completed };
    await db.updateItem(id, updateData);
    const item = await db.getItem(id);
    return res.status(200).json(item);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).send({ error: message });
  }
};
