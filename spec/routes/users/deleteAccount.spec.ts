import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import deleteAccount from '../../../src/server/routes/user/DeleteAccount';
import * as userService from '../../../src/server/services/user.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/services/user.service', () => ({
  deleteUser: jest.fn(),
}));

describe('deleteAccount', () => {
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
      sendStatus: jest.fn().mockReturnThis(),
    };
  });

  it('should delete the user account successfully and return status 204', async () => {
    (userService.deleteUser as jest.Mock).mockResolvedValue(undefined);

    await deleteAccount(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(userService.deleteUser).toHaveBeenCalledWith('user-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await deleteAccount(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });
});