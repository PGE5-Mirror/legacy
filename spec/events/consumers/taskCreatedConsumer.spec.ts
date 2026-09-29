import { startTaskCreatedConsumer } from '../../../src/server/events/consumers/taskCreatedConsumer';
import { consumeEvent } from '../../../src/server/events/rabbitmq';

jest.mock('../../../src/server/events/rabbitmq', () => ({
  consumeEvent: jest.fn(),
}));

describe('taskCreatedConsumer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start the task created consumer and listen to the TaskCreated queue', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    startTaskCreatedConsumer();

    expect(consumeEvent).toHaveBeenCalledTimes(1);
    expect(consumeEvent).toHaveBeenCalledWith('TaskCreated', expect.any(Function));

    const callback = (consumeEvent as jest.Mock).mock.calls[0][1] as (data: {
      taskId: string;
      name: string;
    }) => void;
    const mockTaskData = { taskId: 'task-123', name: 'Test Task' };

    callback(mockTaskData);

    expect(consoleLogSpy).toHaveBeenCalledWith('[TaskCreated] New task created: Test Task (id: task-123)');

    consoleLogSpy.mockRestore();
  });
});
