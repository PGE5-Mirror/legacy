import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getUserExportData } from '../../services/user.service';

export default async function exportUserData(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const data = await getUserExportData(userId);
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user_data_${userId}.json"`);

    return res.status(200).send(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to export user data' });
  }
}
