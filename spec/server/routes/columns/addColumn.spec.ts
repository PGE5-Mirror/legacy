import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import addColumnController from '../../../../src/server/routes/columns/addColumn';
import * as columnsService from '../../../../src/server/services/columns.service';
import { createStandardControllerMocks } from '../../mockupUtils';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/columns.service', () => ({
  createColumn: jest.fn(),
}));

describe('addColumnController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mocks = createStandardControllerMocks({
      body: { name: 'To Do', project_id: 'project-uuid-123' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    });

    mockReq = mocks.mockReq;
    mockRes = mocks.mockRes;
  });

  it('should create a column successfully and return status 201', async () => {
    const mockColumn = { id: 'column-uuid-123', name: 'To Do', project_id: 'project-uuid-123' };

    (columnsService.createColumn as jest.Mock).mockResolvedValue(mockColumn);

    await addColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(columnsService.createColumn).toHaveBeenCalledWith({
      name: 'To Do',
      project_id: 'project-uuid-123',
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockColumn);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await addColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(columnsService.createColumn).not.toHaveBeenCalled();
  });

  it('should return 400 if name is missing or empty', async () => {
    mockReq.body = { name: '', project_id: 'project-uuid-123' };

    await addColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing name' });
    expect(columnsService.createColumn).not.toHaveBeenCalled();
  });

  it('should return 400 if project_id is missing', async () => {
    mockReq.body = { name: 'To Do', project_id: '' };

    await addColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing project_id' });
    expect(columnsService.createColumn).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (columnsService.createColumn as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});