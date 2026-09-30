import amqp from 'amqplib';

jest.mock('amqplib', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
}));

describe('rabbitmq service', () => {
  let mockChannel: Record<string, jest.Mock>;
  let mockConnection: Record<string, jest.Mock>;
  let connect: typeof import('../../src/server/events/rabbitmq').connect;
  let publishEvent: typeof import('../../src/server/events/rabbitmq').publishEvent;
  let consumeEvent: typeof import('../../src/server/events/rabbitmq').consumeEvent;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(undefined),
      sendToQueue: jest.fn().mockReturnValue(true),
      consume: jest.fn(),
      ack: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      on: jest.fn(),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    await jest.isolateModulesAsync(async () => {
      const rabbitmq = await import('../../src/server/events/rabbitmq');
      connect = rabbitmq.connect;
      publishEvent = rabbitmq.publishEvent;
      consumeEvent = rabbitmq.consumeEvent;
    });
  });

  describe('connect', () => {
    it('should connect and return a channel', async () => {
      const channel = await connect();

      expect(amqp.connect).toHaveBeenCalledTimes(1);
      expect(mockConnection.createChannel).toHaveBeenCalledTimes(1);
      expect(channel).toBe(mockChannel);
    });

    it('should reuse the existing channel if already connected', async () => {
      const channel1 = await connect();
      const channel2 = await connect();

      expect(amqp.connect).toHaveBeenCalledTimes(1);
      expect(mockConnection.createChannel).toHaveBeenCalledTimes(1);
      expect(channel1).toBe(channel2);
    });
  });

  describe('publishEvent', () => {
    it('should assert queue and send message to queue', async () => {
      const queueName = 'test-queue';
      const payload = { foo: 'bar' };

      await publishEvent(queueName, payload);

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(queueName, { durable: true });
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        queueName,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
    });
  });

  describe('consumeEvent', () => {
    it('should assert queue and consume messages with acknowledgement', async () => {
      const queueName = 'test-queue';
      const onMessage = jest.fn();
      const mockMessage = {
        content: Buffer.from(JSON.stringify({ data: 'test' })),
      };

      mockChannel.consume.mockImplementation(
        (_queue: string, callback: (_msg: { content: Buffer }) => void) => {
          callback(mockMessage);
        },
      );

      await consumeEvent(queueName, onMessage);

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(queueName, { durable: true });
      expect(mockChannel.consume).toHaveBeenCalledWith(queueName, expect.any(Function));
      expect(onMessage).toHaveBeenCalledWith({ data: 'test' });
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    });
  });
});