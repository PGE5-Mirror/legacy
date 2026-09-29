import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { deleteUser } from '../../services/user.service';

export default async function deleteAccount(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await deleteUser(userId);
    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    const message = error instanceof Error ? error.message : String(error);
    return res.status(401).json({ error: message });
  }
}
