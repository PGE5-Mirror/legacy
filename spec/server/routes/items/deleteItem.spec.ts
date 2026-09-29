import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import deleteItemController from '../../../../src/server/routes/items/deleteItem';
import { getItemById, removeItem } from '../../../../src/server/services/items.service';

jest.mock('../../../../src/server/services/items.service', () => ({
  getItemById: jest.fn(),
  removeItem: jest.fn(),
}));

describe('deleteItemController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'item-uuid-123' },
      user: { id: 'user-uuid-123' } as any,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };
  });

  it('should delete the item successfully and return status 204', async () => {
    const mockItem = { id: 'item-uuid-123', user_id: 'user-uuid-123' };

    (getItemById as jest.Mock).mockResolvedValue(mockItem);
    (removeItem as jest.Mock).mockResolvedValue(undefined);

    await deleteItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(getItemById).toHaveBeenCalledWith('item-uuid-123');
    expect(removeItem).toHaveBeenCalledWith('item-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 401 if the user is not authenticated', async () => {
    mockReq.user = undefined;

    await deleteItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(getItemById).not.toHaveBeenCalled();
  });

  it('should return 404 if the item id is missing', async () => {
    mockReq.params = { id: '' };

    await deleteItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(getItemById).not.toHaveBeenCalled();
  });

  it('should return 404 if the item does not exist', async () => {
    (getItemById as jest.Mock).mockResolvedValue(null);

    await deleteItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task not found' });
    expect(removeItem).not.toHaveBeenCalled();
  });

  it('should return 403 if the user does not own the item', async () => {
    const mockItem = { id: 'item-uuid-123', user_id: 'other-user-uuid' };
    (getItemById as jest.Mock).mockResolvedValue(mockItem);

    await deleteItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(removeItem).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (getItemById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});