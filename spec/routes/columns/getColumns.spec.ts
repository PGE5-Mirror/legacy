import { Request, Response } from 'express';
import getColumnsController from '../../../src/server/routes/getColumns';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getColumns: jest.fn(),
}));

describe('getColumnsController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve columns successfully with project_id query and return status 200', async () => {
    mockReq.query = { project_id: 'project-uuid-123' };
    const mockColumns = [{ id: 'col-1', name: 'To Do', project_id: 'project-uuid-123' }];

    (db.getColumns as jest.Mock).mockResolvedValue(mockColumns);

    await getColumnsController(mockReq, mockRes as Response);

    expect(db.getColumns).toHaveBeenCalledWith('project-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockColumns);
  });

  it('should retrieve columns successfully without project_id query and return status 200', async () => {
    const mockColumns = [{ id: 'col-1', name: 'To Do', project_id: 'project-uuid-123' }];

    (db.getColumns as jest.Mock).mockResolvedValue(mockColumns);

    await getColumnsController(mockReq, mockRes as Response);

    expect(db.getColumns).toHaveBeenCalledWith(undefined);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockColumns);
  });

  it('should return an empty array if no columns are returned', async () => {
    (db.getColumns as jest.Mock).mockResolvedValue(null);

    await getColumnsController(mockReq, mockRes as Response);

    expect(db.getColumns).toHaveBeenCalledWith(undefined);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 if an error occurs', async () => {
    (db.getColumns as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getColumnsController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});