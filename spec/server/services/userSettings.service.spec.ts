import * as userSettingsService from '../../../src/server/services/userSettings.service';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getUserSettings: jest.fn(),
  upsertUserSettings: jest.fn(),
}));

describe('userSettings.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserSettings', () => {
    it('should retrieve user settings by id', async () => {
      const mockSettings = { user_id: 'user-1', high_contrast: false, font_size: 'medium' };

      (db.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);

      const result = await userSettingsService.getUserSettings('user-1');

      expect(db.getUserSettings).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateUserSettings', () => {
    it('should upsert user settings successfully', async () => {
      const updateData = { high_contrast: true, font_size: 'large' };
      const updatedSettings = { user_id: 'user-1', high_contrast: true, font_size: 'large' };

      (db.upsertUserSettings as jest.Mock).mockResolvedValue(updatedSettings);

      const result = await userSettingsService.updateUserSettings('user-1', { high_contrast: true, font_size: 'large' });

      expect(db.upsertUserSettings).toHaveBeenCalledWith('user-1', updateData);
      expect(result).toEqual(updatedSettings);
    });
  });
});