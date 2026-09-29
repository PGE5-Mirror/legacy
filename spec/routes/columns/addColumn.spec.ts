import { Response } from 'express';
import addColumnController from '../../../src/server/routes/addColumn';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  storeColumn: jest.fn(),
}));

describe('addColumnController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: { name: 'To Do', project_id: 'project-uuid-123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should create a column successfully and return status 201', async () => {
    const mockColumn = { id: 'column-uuid-123', name: 'To Do', project_id: 'project-uuid-123' };

    (db.storeColumn as jest.Mock).mockResolvedValue(mockColumn);

    await addColumnController(mockReq, mockRes as Response);

    expect(db.storeColumn).toHaveBeenCalledWith({
      name: 'To Do',
      project_id: 'project-uuid-123',
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockColumn);
  });

  it('should return 400 if name is missing or empty', async () => {
    mockReq.body = { name: '', project_id: 'project-uuid-123' };

    await addColumnController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing name' });
    expect(db.storeColumn).not.toHaveBeenCalled();
  });

  it('should return 400 if project_id is missing', async () => {
    mockReq.body = { name: 'To Do', project_id: '' };

    await addColumnController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing project_id' });
    expect(db.storeColumn).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.storeColumn as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addColumnController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.any(Error));
  });
});