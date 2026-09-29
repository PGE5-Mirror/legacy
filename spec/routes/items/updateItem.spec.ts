import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import updateItemController from '../../../src/server/routes/items/updateItem';
import { getItemById, updateItem } from '../../../src/server/services/items.service';

jest.mock('../../../src/server/services/items.service', () => ({
  getItemById: jest.fn(),
  updateItem: jest.fn(),
}));

describe('updateItemController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'item-uuid-123' },
      body: { name: 'Updated Name', completed: true },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('should update the item successfully and return status 200', async () => {
    const existingItem = { id: 'item-uuid-123', name: 'Old Name', completed: false, userId: 'user-uuid-123' };
    const updatedItem = { id: 'item-uuid-123', name: 'Updated Name', completed: true, userId: 'user-uuid-123' };

    (getItemById as jest.Mock).mockResolvedValue(existingItem);
    (updateItem as jest.Mock).mockResolvedValue(updatedItem);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(getItemById).toHaveBeenCalledWith('item-uuid-123');
    expect(updateItem).toHaveBeenCalledWith({
      id: 'item-uuid-123',
      name: 'Updated Name',
      completed: true,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedItem);
  });

  it('should use existing values if name or completed are not provided in body', async () => {
    const existingItem = { id: 'item-uuid-123', name: 'Old Name', completed: false, userId: 'user-uuid-123' };
    const updatedItem = { id: 'item-uuid-123', name: 'Old Name', completed: false, userId: 'user-uuid-123' };

    mockReq.body = {};
    (getItemById as jest.Mock).mockResolvedValue(existingItem);
    (updateItem as jest.Mock).mockResolvedValue(updatedItem);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(updateItem).toHaveBeenCalledWith({
      id: 'item-uuid-123',
      name: 'Old Name',
      completed: false,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should return 401 if the user is not authenticated', async () => {
    mockReq.user = undefined;

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(getItemById).not.toHaveBeenCalled();
  });

  it('should return 404 if the item does not exist', async () => {
    (getItemById as jest.Mock).mockResolvedValue(null);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Item with id item-uuid-123 not found' });
    expect(updateItem).not.toHaveBeenCalled();
  });

  it('should return 403 if the user does not own the item', async () => {
    const existingItem = { id: 'item-uuid-123', name: 'Old Name', completed: false, userId: 'other-user-uuid' };
    (getItemById as jest.Mock).mockResolvedValue(existingItem);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(updateItem).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (getItemById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Database error' });
  });
});