import amqp, { Channel } from 'amqplib';

let channel: Channel | null = null;

const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASSWORD || 'guest'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;

async function connect(): Promise<Channel> {
  if (channel) return channel;

  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  connection.on('close', () => {
    console.error('RabbitMQ connection closed');
    channel = null;
  });

  connection.on('error', (err) => {
    console.error('RabbitMQ connection error', err);
    channel = null;
  });

  return channel;
}

async function publishEvent<T>(queueName: string, payload: T): Promise<void> {
  const ch = await connect();
  await ch.assertQueue(queueName, { durable: true });
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
}

async function consumeEvent<T>(
  queueName: string,
  onMessage: (data: T) => void | Promise<void>,
): Promise<void> {
  const ch = await connect();
  await ch.assertQueue(queueName, { durable: true });
  // At most one unacknowledged message per consumer, so several consumers share the queue fairly
  await ch.prefetch(1);
  ch.consume(queueName, async (msg) => {
    if (msg) {
      // Ack only once the handler has finished, otherwise the prefetch limit has no effect.
      // A failing message is still acked so it can't block the consumer forever.
      try {
        await onMessage(JSON.parse(msg.content.toString()));
      } catch (err) {
        console.error(`Failed to handle message from ${queueName}`, err);
      } finally {
        ch.ack(msg);
      }
    }
  });
}

export { connect, publishEvent, consumeEvent };
