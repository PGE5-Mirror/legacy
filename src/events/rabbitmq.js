const amqp = require('amqplib');

let channel = null;

const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASSWORD || 'guest'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;

async function connect() {
  if (channel) return channel;

  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  connection.on('close', () => {
    console.error('RabbitMQ connection closed');
    channel = null;
  });

  return channel;
}

async function publishEvent(queueName, payload) {
  const ch = await connect();
  await ch.assertQueue(queueName, { durable: true });
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
}

async function consumeEvent(queueName, onMessage) {
  const ch = await connect();
  await ch.assertQueue(queueName, { durable: true });
  ch.consume(queueName, (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      onMessage(data);
      ch.ack(msg);
    }
  });
}

module.exports = { connect, publishEvent, consumeEvent };
