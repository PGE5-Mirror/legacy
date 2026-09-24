import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const createdProject = await db.storeProject({ name });
    return res.status(201).json(createdProject);
  } catch (err) {
    return res.status(500).json(err);
  }
};
