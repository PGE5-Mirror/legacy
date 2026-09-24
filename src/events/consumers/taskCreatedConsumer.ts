import { consumeEvent } from '../rabbitmq';

interface TaskCreatedData {
  taskId: string;
  name: string;
}

function startTaskCreatedConsumer(): void {
  consumeEvent('TaskCreated', (data: TaskCreatedData) => {
    console.log(`[TaskCreated] New task created: ${data.name} (id: ${data.taskId})`);
  });
}

export { startTaskCreatedConsumer };