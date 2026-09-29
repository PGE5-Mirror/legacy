import * as db from '../../src/server/persistence';
import { v4 as uuid } from 'uuid';
import { createUser, getUserByEmail } from '../../src/server/services/auth.service';

jest.mock('../../src/server/persistence', () => ({
  storeUser: jest.fn(),
  getUser: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully with a generated uuid', async () => {
      const userData = { email: 'test@example.com', password: 'hashed-password' };
      const mockUuid = 'uuid-123';
      const mockCreatedUser = { id: mockUuid, ...userData };

      (uuid as jest.Mock).mockReturnValue(mockUuid);
      (db.storeUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await createUser(userData);

      expect(uuid).toHaveBeenCalledTimes(1);
      expect(db.storeUser).toHaveBeenCalledWith({
        id: mockUuid,
        email: 'test@example.com',
        password: 'hashed-password',
      });
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user when found by email', async () => {
      const email = 'test@example.com';
      const mockUser = { id: 'uuid-123', email, password: 'hashed-password' };

      (db.getUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByEmail(email);

      expect(db.getUser).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const email = 'notfound@example.com';

      (db.getUser as jest.Mock).mockResolvedValue(null);

      const result = await getUserByEmail(email);

      expect(db.getUser).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });
});