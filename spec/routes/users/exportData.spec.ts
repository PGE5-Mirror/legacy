import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import exportUserData from '../../../src/server/routes/user/ExportData';
import * as userService from '../../../src/server/services/user.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../src/server/services/user.service', () => ({
  getUserExportData: jest.fn(),
}));

describe('exportUserData', () => {
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
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
  });

  it('should export user data successfully and return status 200', async () => {
    const mockData = { user: { id: 'user-uuid-123' }, items: [] };

    (userService.getUserExportData as jest.Mock).mockResolvedValue(mockData);

    await exportUserData(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(userService.getUserExportData).toHaveBeenCalledWith('user-uuid-123');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="user_data_user-uuid-123.json"');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith(JSON.stringify(mockData, null, 2));
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await exportUserData(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    expect(userService.getUserExportData).not.toHaveBeenCalled();
  });

  it('should return 404 if user data is not found', async () => {
    (userService.getUserExportData as jest.Mock).mockResolvedValue(null);

    await exportUserData(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(userService.getUserExportData).toHaveBeenCalledWith('user-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
  });
});