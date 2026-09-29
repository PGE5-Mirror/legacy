import { Request, Response } from 'express';
import deleteOrganizationMemberController from '../../../src/server/routes/deleteOrganizationMember';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getOrganizationMember: jest.fn(),
  removeOrganizationMember: jest.fn(),
}));

describe('deleteOrganizationMemberController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123', memberId: 'member-uuid-123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };
  });

  it('should delete the organization member successfully and return status 204', async () => {
    const mockMember = { id: 'member-uuid-123', organization_id: 'org-uuid-123', user_id: 'user-uuid-123' };

    (db.getOrganizationMember as jest.Mock).mockResolvedValue(mockMember);
    (db.removeOrganizationMember as jest.Mock).mockResolvedValue(undefined);

    await deleteOrganizationMemberController(mockReq, mockRes as Response);

    expect(db.getOrganizationMember).toHaveBeenCalledWith('member-uuid-123');
    expect(db.removeOrganizationMember).toHaveBeenCalledWith('member-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 404 if the member does not exist', async () => {
    (db.getOrganizationMember as jest.Mock).mockResolvedValue(undefined);

    await deleteOrganizationMemberController(mockReq, mockRes as Response);

    expect(db.getOrganizationMember).toHaveBeenCalledWith('member-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Member not found' });
    expect(db.removeOrganizationMember).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (db.getOrganizationMember as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteOrganizationMemberController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});