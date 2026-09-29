import { Request, Response } from 'express';
import getProjectsController from '../../../src/server/routes/getProjects';
import * as db from '../../../src/server/persistence';

jest.mock('../../../src/server/persistence', () => ({
  getProjects: jest.fn(),
}));

describe('getProjectsController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: 'org-uuid-123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve projects successfully and return status 200', async () => {
    const mockProjects = [{ id: 'project-1', name: 'Project 1', organization_id: 'org-uuid-123' }];

    (db.getProjects as jest.Mock).mockResolvedValue(mockProjects);

    await getProjectsController(mockReq, mockRes as Response);

    expect(db.getProjects).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
  });

  it('should return an empty array if no projects are returned', async () => {
    (db.getProjects as jest.Mock).mockResolvedValue(null);

    await getProjectsController(mockReq, mockRes as Response);

    expect(db.getProjects).toHaveBeenCalledWith('org-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 if an error occurs', async () => {
    (db.getProjects as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getProjectsController(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});