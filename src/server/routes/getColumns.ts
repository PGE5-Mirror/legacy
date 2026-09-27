import { Request, Response } from 'express';
import * as db from '../persistence';

export default async (req: Request, res: Response): Promise<Response> => {
  try {
    const projectId = typeof req.query.project_id === 'string' ? req.query.project_id : undefined;
    const columns = await db.getColumns(projectId);
    return res.status(200).json(columns || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
};
