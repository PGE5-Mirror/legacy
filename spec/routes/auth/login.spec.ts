import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import loginController from '../../../src/server/routes/auth/login';
import { getUserByEmail } from '../../../src/server/services/auth.service';

jest.mock('../../../src/server/services/auth.service', () => ({
  getUserByEmail: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('loginController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: { email: 'test@example.com', password: 'password123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should login successfully and return status 200 with a token', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', password: 'hashed-password' };
    const mockToken = 'mock-jwt-token';

    (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    await loginController(mockReq as Request, mockRes as Response);

    expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-123', email: 'test@example.com' },
      expect.any(String),
      { expiresIn: '24h' }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Login successful',
      token: mockToken,
    });
  });

  it('should return 400 if email or password is missing or empty', async () => {
    mockReq.body = { email: '', password: 'password123' };

    await loginController(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing email or password' });
    expect(getUserByEmail).not.toHaveBeenCalled();
  });

  it('should return 401 if user does not exist', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(null);

    await loginController(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should return 401 if password is invalid', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', password: 'hashed-password' };
    (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await loginController(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (getUserByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

    await loginController(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});