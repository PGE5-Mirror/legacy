import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, project_id } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!project_id) {
      return res.status(400).json({ error: 'Missing project_id' });
    }

    const createdColumn = await db.storeColumn({ name, project_id });
    return res.status(201).json(createdColumn);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
};
