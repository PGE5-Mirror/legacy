import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (
  req: Request<{ id: string; memberId: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const { memberId } = req.params;

    const existing = await db.getOrganizationMember(memberId);
    if (!existing) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await db.removeOrganizationMember(memberId);
    return res.sendStatus(204);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
};
