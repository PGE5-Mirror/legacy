import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import getColumnsController from '../../../../src/server/routes/columns/getColumns';
import * as columnsService from '../../../../src/server/services/columns.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/columns.service', () => ({
  getColumnsByProjectId: jest.fn(),
}));

describe('getColumnsController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve columns successfully with project_id query and return status 200', async () => {
    mockReq.query = { project_id: 'project-uuid-123' };
    const mockColumns = [{ id: 'col-1', name: 'To Do', project_id: 'project-uuid-123' }];

    (columnsService.getColumnsByProjectId as jest.Mock).mockResolvedValue(mockColumns);

    await getColumnsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(columnsService.getColumnsByProjectId).toHaveBeenCalledWith('project-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockColumns);
  });

  it('should retrieve columns successfully without project_id query and return status 200', async () => {
    const mockColumns = [{ id: 'col-1', name: 'To Do', project_id: 'project-uuid-123' }];

    (columnsService.getColumnsByProjectId as jest.Mock).mockResolvedValue(mockColumns);

    await getColumnsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(columnsService.getColumnsByProjectId).toHaveBeenCalledWith('');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockColumns);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await getColumnsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(columnsService.getColumnsByProjectId).not.toHaveBeenCalled();
  });

  it('should return an empty array if no columns are returned', async () => {
    (columnsService.getColumnsByProjectId as jest.Mock).mockResolvedValue(null);

    await getColumnsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(columnsService.getColumnsByProjectId).toHaveBeenCalledWith('');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 if an error occurs', async () => {
    (columnsService.getColumnsByProjectId as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getColumnsController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});