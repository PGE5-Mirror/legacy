import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existing = await db.getOrganization(id);
    if (!existing) {
      return res.status(404).json({ message: `Organization with id ${id} not found` });
    }

    await db.updateOrganization(id, { name });
    const organization = await db.getOrganization(id);
    return res.status(200).json(organization);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).send({ error: message });
  }
};
