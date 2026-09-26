import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const createdProject = await db.storeProject({ name, organization_id: id });
    return res.status(201).json(createdProject);
  } catch (err) {
    return res.status(500).json(err);
  }
};
