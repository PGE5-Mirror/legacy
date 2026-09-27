import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, position } = req.body;

    const existing = await db.getColumn(id);
    if (!existing) {
      return res.status(404).json({ message: `Column with id ${id} not found` });
    }

    await db.updateColumn(id, { name, position });
    const column = await db.getColumn(id);
    return res.status(200).json(column);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).send({ error: message });
  }
};
