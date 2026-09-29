import { startTaskCreatedConsumer } from '../../../src/server/events/consumers/taskCreatedConsumer';
import { consumeEvent } from '../../../src/server/events/rabbitmq';
import { createNotification } from '../../../src/server/services/notifications.service';

jest.mock('../../../src/server/events/rabbitmq', () => ({
  consumeEvent: jest.fn(),
}));

jest.mock('../../../src/server/services/notifications.service', () => ({
  createNotification: jest.fn(),
}));

describe('taskCreatedConsumer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start the task created consumer and listen to the TaskCreated queue', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    (createNotification as jest.Mock).mockResolvedValue(undefined);

    startTaskCreatedConsumer();

    expect(consumeEvent).toHaveBeenCalledTimes(1);
    expect(consumeEvent).toHaveBeenCalledWith('TaskCreated', expect.any(Function));

    const callback = (consumeEvent as jest.Mock).mock.calls[0][1] as (data: {
      taskId: string;
      name: string;
      userId: string;
    }) => Promise<void>;
    const mockTaskData = { taskId: 'task-123', name: 'Test Task', userId: 'user-123' };

    await callback(mockTaskData);

    expect(consoleLogSpy).toHaveBeenCalledWith('[TaskCreated] New task created: Test Task (id: task-123)');
    expect(createNotification).toHaveBeenCalledWith({
      userId: 'user-123',
      message: 'Task "Test Task" was created',
    });

    consoleLogSpy.mockRestore();
  });
});
