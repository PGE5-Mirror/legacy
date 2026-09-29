import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import updateColumnController from '../../../src/server/routes/columns/updateColumn';
import * as columnsService from '../../../src/server/services/columns.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/services/columns.service', () => ({
  getColumnById: jest.fn(),
  updateColumn: jest.fn(),
}));

describe('updateColumnController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'column-uuid-123' },
      body: { name: 'In Progress', position: 1 },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
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

    (columnsService.getColumnById as jest.Mock)
      .mockResolvedValueOnce(existingColumn)
      .mockResolvedValueOnce(updatedColumn);
    (columnsService.updateColumn as jest.Mock).mockResolvedValue(undefined);

    await updateColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(columnsService.getColumnById).toHaveBeenCalledWith('column-uuid-123');
    expect(columnsService.updateColumn).toHaveBeenCalledWith('column-uuid-123', { name: 'In Progress', position: 1 });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedColumn);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await updateColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(columnsService.getColumnById).not.toHaveBeenCalled();
  });

  it('should return 404 if the column does not exist', async () => {
    (columnsService.getColumnById as jest.Mock).mockResolvedValue(undefined);

    await updateColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(columnsService.getColumnById).toHaveBeenCalledWith('column-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Column with id column-uuid-123 not found' });
    expect(columnsService.updateColumn).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (columnsService.getColumnById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Database error' });
  });
});