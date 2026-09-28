import { Response } from 'express';
import deleteColumnController from '../../../src/server/routes/deleteColumn';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getColumn: jest.fn(),
  removeColumn: jest.fn(),
}));

describe('deleteColumnController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'column-uuid-123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };
  });

  it('should delete the column successfully and return status 204', async () => {
    const mockColumn = { id: 'column-uuid-123', name: 'To Do' };

    (db.getColumn as jest.Mock).mockResolvedValue(mockColumn);
    (db.removeColumn as jest.Mock).mockResolvedValue(undefined);

    await deleteColumnController(mockReq, mockRes as Response);

    expect(db.getColumn).toHaveBeenCalledWith('column-uuid-123');
    expect(db.removeColumn).toHaveBeenCalledWith('column-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 404 if id is missing', async () => {
    mockReq.params = { id: '' };

    await deleteColumnController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(db.getColumn).not.toHaveBeenCalled();
  });

  it('should return 404 if the column does not exist', async () => {
    (db.getColumn as jest.Mock).mockResolvedValue(undefined);

    await deleteColumnController(mockReq, mockRes as Response);

    expect(db.getColumn).toHaveBeenCalledWith('column-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Column not found' });
    expect(db.removeColumn).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.getColumn as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteColumnController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});