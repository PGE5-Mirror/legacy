import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import getItemsByColumnController from '../../../../src/server/routes/items/getItemsByColumn';
import * as itemsService from '../../../../src/server/services/items.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/items.service', () => ({
  getItemsByColumnId: jest.fn(),
}));

describe('getItemsByColumnController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'column-uuid-123' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve items successfully and return status 200', async () => {
    const mockTasks = [{ id: 'item-1', name: 'Task 1', column_id: 'column-uuid-123' }];

    (itemsService.getItemsByColumnId as jest.Mock).mockResolvedValue(mockTasks);

    await getItemsByColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(itemsService.getItemsByColumnId).toHaveBeenCalledWith('column-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await getItemsByColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(itemsService.getItemsByColumnId).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (itemsService.getItemsByColumnId as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getItemsByColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});