import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';

jest.mock('amqplib', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
}));

describe('rabbitmq service', () => {
  let mockChannel: Channel;
  let mockConnection: Connection;
  let connect: typeof import('../../../src/server/events/rabbitmq').connect;
  let publishEvent: typeof import('../../../src/server/events/rabbitmq').publishEvent;
  let consumeEvent: typeof import('../../../src/server/events/rabbitmq').consumeEvent;

  beforeEach(() => {
    jest.clearAllMocks();

    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(undefined),
      sendToQueue: jest.fn().mockReturnValue(true),
      prefetch: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn(),
      ack: jest.fn(),
    } as unknown as Channel;

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      on: jest.fn(),
    } as unknown as Connection;

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const rabbitmq = require('../../../src/server/events/rabbitmq');
      connect = rabbitmq.connect;
      publishEvent = rabbitmq.publishEvent;
      consumeEvent = rabbitmq.consumeEvent;
    });
  });

  describe('connect', () => {
    it('should connect and return a channel', async () => {
      const channel = await connect();

      expect(amqp.connect).toHaveBeenCalledTimes(1);
      expect((mockConnection as unknown as { createChannel: jest.Mock }).createChannel).toHaveBeenCalledTimes(1);
      expect(channel).toBe(mockChannel);
    });

    it('should reuse the existing channel if already connected', async () => {
      const channel1 = await connect();
      const channel2 = await connect();

      expect(amqp.connect).toHaveBeenCalledTimes(1);
      expect((mockConnection as unknown as { createChannel: jest.Mock }).createChannel).toHaveBeenCalledTimes(1);
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
    const mockMessage = {
      content: Buffer.from(JSON.stringify({ data: 'test' })),
    } as unknown as ConsumeMessage;

    // Simulates RabbitMQ delivering a message to the callback registered with consume()
    function deliver(message: ConsumeMessage | null) {
      const callback = (mockChannel.consume as jest.Mock).mock.calls[0][1];
      return callback(message) as Promise<void>;
    }

    it('should assert queue and consume messages with acknowledgement', async () => {
      const queueName = 'test-queue';
      const onMessage = jest.fn();

      await consumeEvent(queueName, onMessage);
      await deliver(mockMessage);

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(queueName, { durable: true });
      expect(mockChannel.consume).toHaveBeenCalledWith(queueName, expect.any(Function));
      expect(onMessage).toHaveBeenCalledWith({ data: 'test' });
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    });

    it('should set a prefetch limit of 1 before consuming', async () => {
      await consumeEvent('test-queue', jest.fn());

      expect(mockChannel.prefetch).toHaveBeenCalledWith(1);
      const prefetchOrder = (mockChannel.prefetch as jest.Mock).mock.invocationCallOrder[0];
      const consumeOrder = (mockChannel.consume as jest.Mock).mock.invocationCallOrder[0];
      expect(prefetchOrder).toBeLessThan(consumeOrder);
    });

    it('should only ack once the handler has finished', async () => {
      let finishHandler: () => void = () => {};
      const onMessage = jest.fn(() => new Promise<void>((resolve) => (finishHandler = resolve)));

      await consumeEvent('test-queue', onMessage);
      const delivery = deliver(mockMessage);

      expect(onMessage).toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();

      finishHandler();
      await delivery;

      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    });

    it('should still ack when the handler fails, so the consumer is not blocked', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onMessage = jest.fn().mockRejectedValue(new Error('Database down'));

      await consumeEvent('test-queue', onMessage);
      await deliver(mockMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to handle message from test-queue',
        expect.any(Error),
      );
      consoleError.mockRestore();
    });

    it('should ignore empty deliveries', async () => {
      const onMessage = jest.fn();

      await consumeEvent('test-queue', onMessage);
      await deliver(null);

      expect(onMessage).not.toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });
  });
});