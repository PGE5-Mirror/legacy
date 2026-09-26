import { Response } from 'express';
import * as db from '../persistence';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export default async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. Missing token.' });
    }

    const createdOrganization = await db.storeOrganization({ name });

    await db.storeOrganizationMember({
      organization_id: createdOrganization.id,
      user_id: req.user.id,
      role: 'admin',
    });

    return res.status(201).json(createdOrganization);
  } catch (err) {
    return res.status(500).json(err);
  }
};
