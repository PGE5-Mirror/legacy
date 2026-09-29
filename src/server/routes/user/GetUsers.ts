import { Request, Response } from 'express';
import * as db from '../../persistence';

export default async function getUsers(_req: Request, res: Response): Promise<Response> {
  try {
    const users = await db.getUsers();
    return res.status(200).json(users);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
