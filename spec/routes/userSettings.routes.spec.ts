import request from 'supertest';
import express from 'express';
import router from '../../src/server/routes/userSettings.routes';
import * as userSettingsService from '../../src/server/services/userSettings.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../src/server/services/userSettings.service', () => ({
  getUserSettings: jest.fn(),
  updateUserSettings: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(router);

describe('userSettings.routes', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('GET /users/me/settings should call getUserSettingsController and return 200', async () => {
    const mockSettings = { user_id: 'user-uuid-123', high_contrast: false, font_size: 'medium' };
    (userSettingsService.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);

    const response = await request(app).get('/users/me/settings');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSettings);
  });

  it('PUT /users/me/settings should call updateUserSettingsController and return 200', async () => {
    const mockSettings = { user_id: 'user-uuid-123', high_contrast: true, font_size: 'large' };
    (userSettingsService.updateUserSettings as jest.Mock).mockResolvedValue(mockSettings);

    const response = await request(app)
      .put('/users/me/settings')
      .send({ high_contrast: true, font_size: 'large' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSettings);
  });
});