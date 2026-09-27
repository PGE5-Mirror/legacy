import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existing = await db.getProject(id);
    if (!existing) {
      return res.status(404).json({ message: `Project with id ${id} not found` });
    }

    await db.updateProject(id, { name });
    const project = await db.getProject(id);
    return res.status(200).json(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).send({ error: message });
  }
};
