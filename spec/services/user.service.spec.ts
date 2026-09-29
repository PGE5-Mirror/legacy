import * as userService from '../../src/server/services/user.service';
import * as db from '../../src/server/persistence';

jest.mock('../../src/server/persistence', () => ({
  deleteUser: jest.fn(),
  getUserExportData: jest.fn(),
  getUsers: jest.fn(),
}));

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteUser', () => {
    it('should delete a user by id', async () => {
      (db.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await userService.deleteUser('user-uuid-123');

      expect(db.deleteUser).toHaveBeenCalledWith('user-uuid-123');
    });
  });

  describe('getUserExportData', () => {
    it('should retrieve export data for a user', async () => {
      const mockExportData = { user: { id: 'user-uuid-123' }, items: [] };
      (db.getUserExportData as jest.Mock).mockResolvedValue(mockExportData);

      const result = await userService.getUserExportData('user-uuid-123');

      expect(db.getUserExportData).toHaveBeenCalledWith('user-uuid-123');
      expect(result).toEqual(mockExportData);
    });
  });

  describe('getUsers', () => {
    it('should retrieve all users', async () => {
      const mockUsers = [{ id: 'user-uuid-123', email: 'test@example.com' }];
      (db.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getUsers();

      expect(db.getUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });
});