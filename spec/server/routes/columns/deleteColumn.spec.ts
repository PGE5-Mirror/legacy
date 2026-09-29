import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import deleteColumnController from '../../../../src/server/routes/columns/deleteColumn';
import * as columnsService from '../../../../src/server/services/columns.service';
import { createStandardControllerMocks } from '../../mockupUtils';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../../../src/server/services/columns.service', () => ({
  getColumnById: jest.fn(),
  removeColumn: jest.fn(),
}));

describe('deleteColumnController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mocks = createStandardControllerMocks({
      params: { id: 'column-uuid-123' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    });

    mockReq = mocks.mockReq;
    mockRes = mocks.mockRes;
  });

  it('should delete the column successfully and return status 204', async () => {
    const mockColumn = { id: 'column-uuid-123', name: 'To Do' };

    (columnsService.getColumnById as jest.Mock).mockResolvedValue(mockColumn);
    (columnsService.removeColumn as jest.Mock).mockResolvedValue(undefined);

    await deleteColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(columnsService.getColumnById).toHaveBeenCalledWith('column-uuid-123');
    expect(columnsService.removeColumn).toHaveBeenCalledWith('column-uuid-123');
    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await deleteColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(columnsService.getColumnById).not.toHaveBeenCalled();
  });

  it('should return 404 if id is missing', async () => {
    mockReq.params = { id: '' };

    await deleteColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing id' });
    expect(columnsService.getColumnById).not.toHaveBeenCalled();
  });

  it('should return 404 if the column does not exist', async () => {
    (columnsService.getColumnById as jest.Mock).mockResolvedValue(undefined);

    await deleteColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(columnsService.getColumnById).toHaveBeenCalledWith('column-uuid-123');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Column not found' });
    expect(columnsService.removeColumn).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    (columnsService.getColumnById as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteColumnController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});