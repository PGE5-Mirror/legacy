const { consumeEvent } = require('../rabbitmq');

function startTaskCreatedConsumer() {
  consumeEvent('TaskCreated', (data) => {
    console.log(`[TaskCreated] New task created: ${data.name} (id: ${data.taskId})`);
  });
}

module.exports = { startTaskCreatedConsumer };
