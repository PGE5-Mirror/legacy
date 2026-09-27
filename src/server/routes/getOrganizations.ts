import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request, res: Response): Promise<Response> => {
  try {
    const organizations = await db.getOrganizations();
    return res.status(200).json(organizations || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
};
