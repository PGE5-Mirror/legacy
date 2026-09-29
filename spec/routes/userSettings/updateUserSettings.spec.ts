import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import updateUserSettingsController from '../../../src/server/routes/userSettings/updateUserSettings';
import * as userSettingsService from '../../../src/server/services/userSettings.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/services/userSettings.service', () => ({
  updateUserSettings: jest.fn(),
}));

describe('updateUserSettingsController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: { high_contrast: true, font_size: 'large' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should update user settings successfully and return status 200', async () => {
    const mockSettings = { user_id: 'user-uuid-123', high_contrast: true, font_size: 'large' };

    (userSettingsService.updateUserSettings as jest.Mock).mockResolvedValue(mockSettings);

    await updateUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(userSettingsService.updateUserSettings).toHaveBeenCalledWith('user-uuid-123', {
      high_contrast: true,
      font_size: 'large',
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockSettings);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await updateUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(userSettingsService.updateUserSettings).not.toHaveBeenCalled();
  });

  it('should return 400 if high_contrast is not a boolean', async () => {
    mockReq.body = { high_contrast: 'invalid-bool', font_size: 'large' };

    await updateUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'high_contrast must be a boolean' });
    expect(userSettingsService.updateUserSettings).not.toHaveBeenCalled();
  });

  it('should return 400 if font_size is invalid', async () => {
    mockReq.body = { high_contrast: true, font_size: 'extra-large' };

    await updateUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'font_size must be small, medium or large' });
    expect(userSettingsService.updateUserSettings).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (userSettingsService.updateUserSettings as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updateUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});