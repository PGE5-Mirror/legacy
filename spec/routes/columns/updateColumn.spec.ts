import { Response } from 'express';
import updateColumnController from '../../../src/server/routes/updateColumn';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getColumn: jest.fn(),
  updateColumn: jest.fn(),
}));

describe('updateColumnController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'column-uuid-123' },
      body: { name: 'In Progress', position: 1 },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('should update the column successfully and return status 200', async () => {
    const existingColumn = { id: 'column-uuid-123', name: 'To Do', position: 0 };
    const updatedColumn = { id: 'column-uuid-123', name: 'In Progress', position: 1 };

    (db.getColumn as jest.Mock)
      .mockResolvedValueOnce(existingColumn)
      .mockResolvedValueOnce(updatedColumn);
    (db.updateColumn as jest.Mock).mockResolvedValue(undefined);

    await updateColumnController(mockReq, mockRes as Response);

    expect(db.getColumn).toHaveBeenCalledWith('column-uuid-123');
    expect(db.updateColumn).toHaveBeenCalledWith('column-uuid-123', { name: 'In Progress', position: 1 });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedColumn);
  });

  it('should return 404 if the column does not exist', async () => {
    (db.getColumn as jest.Mock).mockResolvedValue(undefined);

    await updateColumnController(mockReq, mockRes as Response);

    expect(db.getColumn).toHaveBeenCalledWith('column-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Column with id column-uuid-123 not found' });
    expect(db.updateColumn).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.getColumn as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateColumnController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Database error' });
  });
});