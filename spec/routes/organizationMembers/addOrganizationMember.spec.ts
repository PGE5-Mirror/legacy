import { Request, Response } from 'express';
import addOrganizationMemberController from '../../../src/server/routes/addOrganizationMember';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  storeOrganizationMember: jest.fn(),
}));

describe('addOrganizationMemberController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
      body: { user_id: 'user-uuid-123', role: 'admin' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should add an organization member successfully and return status 201', async () => {
    const mockCreatedMember = { id: 'member-123', organization_id: 'org-uuid-123', user_id: 'user-uuid-123', role: 'admin' };

    (db.storeOrganizationMember as jest.Mock).mockResolvedValue(mockCreatedMember);

    await addOrganizationMemberController(mockReq, mockRes as Response);

    expect(db.storeOrganizationMember).toHaveBeenCalledWith({
      organization_id: 'org-uuid-123',
      user_id: 'user-uuid-123',
      role: 'admin',
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockCreatedMember);
  });

  it('should return 400 if user_id is missing', async () => {
    mockReq.body = { role: 'admin' };

    await addOrganizationMemberController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing user_id' });
    expect(db.storeOrganizationMember).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.storeOrganizationMember as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addOrganizationMemberController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.any(Error));
  });
});