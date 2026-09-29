import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import getUsers from '../../../src/server/routes/user/GetUsers';
import * as userService from '../../../src/server/services/user.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/services/user.service', () => ({
  getUsers: jest.fn(),
}));

describe('getUsers', () => {
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

  it('should retrieve users successfully and return status 200', async () => {
    const mockUsers = [{ id: 'user-1', email: 'user1@example.com' }];

    (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    await getUsers(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(userService.getUsers).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
  });

  it('should return 500 if an error occurs', async () => {
    (userService.getUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getUsers(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});