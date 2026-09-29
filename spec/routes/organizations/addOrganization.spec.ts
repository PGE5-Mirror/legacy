import { Response } from 'express';
import { AuthenticatedRequest } from '../../../src/server/middlewares/auth.middleware';
import addOrganizationController from '../../../src/server/routes/addOrganization';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  storeOrganization: jest.fn(),
  storeOrganizationMember: jest.fn(),
}));

describe('addOrganizationController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: { name: 'New Organization' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should create an organization and add user as admin, then return status 201', async () => {
    const mockOrg = { id: 'org-uuid-123', name: 'New Organization' };

    (db.storeOrganization as jest.Mock).mockResolvedValue(mockOrg);
    (db.storeOrganizationMember as jest.Mock).mockResolvedValue(undefined);

    await addOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(db.storeOrganization).toHaveBeenCalledWith({ name: 'New Organization' });
    expect(db.storeOrganizationMember).toHaveBeenCalledWith({
      organization_id: 'org-uuid-123',
      user_id: 'user-uuid-123',
      role: 'admin',
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockOrg);
  });

  it('should return 400 if name is missing or empty', async () => {
    mockReq.body = { name: '' };

    await addOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing name' });
    expect(db.storeOrganization).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await addOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Missing token.' });
    expect(db.storeOrganization).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.storeOrganization as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addOrganizationController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.any(Error));
  });
});