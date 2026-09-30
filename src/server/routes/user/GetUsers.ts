import { Request, Response } from 'express';
import { getUsers } from '../../services/user.service';

export default async function getUsersController(_req: Request, res: Response): Promise<Response> {
  try {
    const users = await getUsers();
    return res.status(200).json(users);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
