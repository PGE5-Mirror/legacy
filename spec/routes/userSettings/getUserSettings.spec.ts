import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import getUserSettingsController from '../../../src/server/routes/userSettings/getUserSettings';
import * as userSettingsService from '../../../src/server/services/userSettings.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/services/userSettings.service', () => ({
  getUserSettings: jest.fn(),
}));

describe('getUserSettingsController', () => {
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

  it('should retrieve user settings successfully and return status 200', async () => {
    const mockSettings = { user_id: 'user-uuid-123', high_contrast: true, font_size: 'large' };

    (userSettingsService.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);

    await getUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(userSettingsService.getUserSettings).toHaveBeenCalledWith('user-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockSettings);
  });

  it('should return default settings if none are found', async () => {
    (userSettingsService.getUserSettings as jest.Mock).mockResolvedValue(null);

    await getUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(userSettingsService.getUserSettings).toHaveBeenCalledWith('user-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      user_id: 'user-uuid-123',
      high_contrast: false,
      font_size: 'medium',
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await getUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(userSettingsService.getUserSettings).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (userSettingsService.getUserSettings as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getUserSettingsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});