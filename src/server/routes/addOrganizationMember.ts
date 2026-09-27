import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    const createdMember = await db.storeOrganizationMember({
      organization_id: id,
      user_id,
      role,
    });

    return res.status(201).json(createdMember);
  } catch (err) {
    return res.status(500).json(err);
  }
};
