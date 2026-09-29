import { consumeEvent } from '../rabbitmq';
import { createNotification } from '../../services/notifications.service';

interface TaskCreatedData {
  taskId: string;
  name: string;
  userId: string;
}

function startTaskCreatedConsumer(): void {
  consumeEvent('TaskCreated', async (data: TaskCreatedData) => {
    console.log(`[TaskCreated] New task created: ${data.name} (id: ${data.taskId})`);

    try {
      await createNotification({
        userId: data.userId,
        message: `Task "${data.name}" was created`,
      });
    } catch (err) {
      console.error('Failed to create notification for TaskCreated event:', err);
    }
  });
}

export { startTaskCreatedConsumer };
