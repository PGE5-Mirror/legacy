import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import updateItemController from '../../../../src/server/routes/items/updateItem';
import * as itemsService from '../../../../src/server/services/items.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/items.service', () => ({
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
    const existingItem = { id: 'item-uuid-123', name: 'Old Name', completed: false, user_id: 'user-uuid-123' };
    const updatedItem = { id: 'item-uuid-123', name: 'Updated Name', completed: true, user_id: 'user-uuid-123' };

    (itemsService.getItemById as jest.Mock).mockResolvedValue(existingItem);
    (itemsService.updateItem as jest.Mock).mockResolvedValue(updatedItem);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(itemsService.getItemById).toHaveBeenCalledWith('item-uuid-123');
    expect(itemsService.updateItem).toHaveBeenCalledWith('item-uuid-123', {
      name: 'Updated Name',
      completed: true,
      column_id: undefined,
      assigned_to: undefined,
      position: undefined,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedItem);
  });

  it('should return 401 if the user is not authenticated', async () => {
    mockReq.user = undefined;

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(itemsService.getItemById).not.toHaveBeenCalled();
  });

  it('should return 404 if the item does not exist', async () => {
    (itemsService.getItemById as jest.Mock).mockResolvedValue(null);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Item with id item-uuid-123 not found' });
    expect(itemsService.updateItem).not.toHaveBeenCalled();
  });

  it('should return 403 if the user does not own the item', async () => {
    const existingItem = { id: 'item-uuid-123', name: 'Old Name', completed: false, user_id: 'other-user-uuid' };
    (itemsService.getItemById as jest.Mock).mockResolvedValue(existingItem);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(itemsService.updateItem).not.toHaveBeenCalled();
  });

  it('should return 400 if name is empty', async () => {
    const existingItem = { id: 'item-uuid-123', name: 'Old Name', completed: false, user_id: 'user-uuid-123' };
    mockReq.body = { name: '   ' };
    (itemsService.getItemById as jest.Mock).mockResolvedValue(existingItem);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task name cannot be empty' });
    expect(itemsService.updateItem).not.toHaveBeenCalled();
  });

  it('should return 400 if position is invalid', async () => {
    const existingItem = { id: 'item-uuid-123', name: 'Old Name', completed: false, user_id: 'user-uuid-123' };
    mockReq.body = { position: -1 };
    (itemsService.getItemById as jest.Mock).mockResolvedValue(existingItem);

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Position must be a positive integer' });
    expect(itemsService.updateItem).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (itemsService.getItemById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});