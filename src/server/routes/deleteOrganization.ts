import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) return res.status(404).json({ error: 'Missing id' });

    const existing = await db.getOrganization(id);
    if (!existing) {
      return res.status(404).json({ message: `Organization not found` });
    }

    await db.removeOrganization(id);
    return res.sendStatus(204);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
};
