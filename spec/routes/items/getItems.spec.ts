import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import getItemsController from '../../../src/server/routes/items/getItems';
import { getItemsByUserId } from '../../../src/server/services/items.service';

jest.mock('../../../src/server/services/items.service', () => ({
  getItemsByUserId: jest.fn(),
}));

describe('getItemsController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should return items successfully with status 200', async () => {
    const mockItems = [{ id: '1', name: 'Item 1' }];
    (getItemsByUserId as jest.Mock).mockResolvedValue(mockItems);

    await getItemsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(getItemsByUserId).toHaveBeenCalledWith('user-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockItems);
  });

  it('should return an empty array with status 200 if items is null or undefined', async () => {
    (getItemsByUserId as jest.Mock).mockResolvedValue(null);

    await getItemsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 401 if the user is not authenticated', async () => {
    mockReq.user = undefined;

    await getItemsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(getItemsByUserId).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (getItemsByUserId as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getItemsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});
