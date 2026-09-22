import { consumeEvent } from '../rabbitmq';

export function startTaskCreatedConsumer(): void {
  consumeEvent('TaskCreated', (data: { taskId: string; name: string }) => {
    console.log(`[TaskCreated] New task created: ${data.name} (id: ${data.taskId})`);
  });
}
