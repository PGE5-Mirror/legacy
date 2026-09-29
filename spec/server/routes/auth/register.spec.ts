import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import registerController from '../../../../src/server/routes/auth/register';
import { getUserByEmail, createUser } from '../../../../src/server/services/auth.service';

jest.mock('../../../../src/server/services/auth.service', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('registerController', () => {
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

  it('should register a user successfully and return status 201', async () => {
    const mockCreatedUser = { id: 'user-123', email: 'test@example.com', createdAt: '2026-01-01' };

    (getUserByEmail as jest.Mock).mockResolvedValue(null);
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('mock-salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (createUser as jest.Mock).mockResolvedValue(mockCreatedUser);

    await registerController(mockReq as Request, mockRes as Response);

    expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mock-salt');
    expect(createUser).toHaveBeenCalledWith({ email: 'test@example.com', password: 'hashed-password' });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'test@example.com',
      createdAt: '2026-01-01',
    });
  });

  it('should return 400 if email or password is missing or empty', async () => {
    mockReq.body = { email: '', password: 'password123' };

    await registerController(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing email or password' });
    expect(getUserByEmail).not.toHaveBeenCalled();
  });

  it('should return 409 if email already exists', async () => {
    const existingUser = { id: 'user-123', email: 'test@example.com' };
    (getUserByEmail as jest.Mock).mockResolvedValue(existingUser);

    await registerController(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email already exists' });
    expect(createUser).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (getUserByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

    await registerController(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});