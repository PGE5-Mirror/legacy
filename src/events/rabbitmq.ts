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

  return channel;
}

export async function publishEvent(queueName: string, payload: unknown): Promise<void> {
  const ch = await connect();
  await ch.assertQueue(queueName, { durable: true });
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
}

export async function consumeEvent<T = unknown>(
  queueName: string,
  onMessage: (data: T) => void,
): Promise<void> {
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
