import { startTaskCreatedConsumer } from '../../../../src/server/events/consumers/taskCreatedConsumer';
import { consumeEvent } from '../../../../src/server/events/rabbitmq';
import { createNotification } from '../../../../src/server/services/notifications.service';

jest.mock('../../../../src/server/events/rabbitmq', () => ({
  consumeEvent: jest.fn(),
}));

jest.mock('../../../../src/server/services/notifications.service', () => ({
  createNotification: jest.fn(),
}));

describe('taskCreatedConsumer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start the task created consumer and create a notification on event', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    (createNotification as jest.Mock).mockResolvedValueOnce(undefined);

    startTaskCreatedConsumer();

    expect(consumeEvent).toHaveBeenCalledTimes(1);
    expect(consumeEvent).toHaveBeenCalledWith('TaskCreated', expect.any(Function));

    const callback = (consumeEvent as jest.Mock).mock.calls[0][1];
    const mockTaskData = { taskId: 'task-123', name: 'Test Task', userId: 'user-1' };

    await callback(mockTaskData);

    expect(consoleLogSpy).toHaveBeenCalledWith('[TaskCreated] New task created: Test Task (id: task-123)');
    expect(createNotification).toHaveBeenCalledTimes(1);
    expect(createNotification).toHaveBeenCalledWith({
      userId: 'user-1',
      message: 'Task "Test Task" was created',
    });

    consoleLogSpy.mockRestore();
  });

  it('should handle errors when notification creation fails', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('DB Error');
    
    (createNotification as jest.Mock).mockRejectedValueOnce(mockError);

    startTaskCreatedConsumer();

    const callback = (consumeEvent as jest.Mock).mock.calls[0][1];
    const mockTaskData = { taskId: 'task-123', name: 'Test Task', userId: 'user-1' };

    await callback(mockTaskData);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to create notification for TaskCreated event:',
      mockError
    );

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});