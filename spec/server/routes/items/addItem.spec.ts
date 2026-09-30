import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../src/server/middlewares/auth.middleware';
import addItemController from '../../../../src/server/routes/items/addItem';
import { createItem } from '../../../../src/server/services/items.service';
import { publishEvent } from '../../../../src/server/events/rabbitmq';

jest.mock('../../../../src/server/services/items.service', () => ({
  createItem: jest.fn(),
}));

jest.mock('../../../../src/server/events/rabbitmq', () => ({
  publishEvent: jest.fn(),
}));

describe('addItemController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: { name: 'Task' },
      user: { id: 'user-uuid-123', email: 'test@example.com' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should create an item successfully, publish an event, and return status 201', async () => {
    const mockCreatedTask = { 
      id: 'task-uuid-123', 
      name: 'Task', 
      user_id: 'user-uuid-123',
      column_id: null,
      assigned_to: null,
      position: 0
    };
    
    (createItem as jest.Mock).mockResolvedValue(mockCreatedTask);
    (publishEvent as jest.Mock).mockResolvedValue(undefined);

    await addItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(createItem).toHaveBeenCalledTimes(1);
    expect(createItem).toHaveBeenCalledWith({
      name: 'Task',
      user_id: 'user-uuid-123',
      column_id: null,
      assigned_to: null,
      position: 0,
    });
    
    expect(publishEvent).toHaveBeenCalledTimes(1);
    expect(publishEvent).toHaveBeenCalledWith('TaskCreated', {
      taskId: 'task-uuid-123',
      name: 'Task',
      columnId: null,
      assignedTo: null,
      userId: 'user-uuid-123',
    });

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockCreatedTask);
  });

  it('should return 401 if the user is not authenticated', async () => {
    mockReq.user = undefined;

    await addItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(createItem).not.toHaveBeenCalled();
  });

  it('should return 400 if the name is missing or empty', async () => {
    mockReq.body = { name: '   ' };

    await addItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing title' });
    expect(createItem).not.toHaveBeenCalled();
  });

  it('should proceed and return 201 even if event publication fails', async () => {
    const mockCreatedTask = { 
      id: 'task-uuid-123', 
      name: 'Task', 
      user_id: 'user-uuid-123',
      column_id: null,
      assigned_to: null,
      position: 0
    };
    
    (createItem as jest.Mock).mockResolvedValue(mockCreatedTask);
    (publishEvent as jest.Mock).mockRejectedValue(new Error('RabbitMQ down'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await addItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockCreatedTask);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should return 500 if the persistence layer throws an error', async () => {
    (createItem as jest.Mock).mockRejectedValue(new Error('DB connection error'));

    await addItemController(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'DB connection error' });
  });
});