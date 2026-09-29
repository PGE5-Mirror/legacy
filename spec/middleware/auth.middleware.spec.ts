import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken, AuthenticatedRequest } from '../../src/server/middlewares/auth.middleware';
import { getUserById } from '../../src/server/persistence';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../../src/server/persistence', () => ({
  getUserById: jest.fn(),
}));

describe('verifyToken middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  it('should call next() and attach user to request if token is valid', async () => {
    const mockDecodedUser = { id: 'user-123', email: 'test@example.com' };
    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedUser);
    (getUserById as jest.Mock).mockResolvedValue(mockDecodedUser);

    await verifyToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect(mockReq.user).toEqual(mockDecodedUser);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header is missing', async () => {
    mockReq.headers = {};

    await verifyToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Missing token.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', async () => {
    mockReq.headers = { authorization: 'InvalidFormat' };

    await verifyToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Missing token.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token verification fails', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Token expired');
    });

    await verifyToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});