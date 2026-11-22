import * as amqplib from 'amqplib';
import {
  formatPrivateKey,
  MessageTracker,
  parseMessage,
  parsePublishArguments,
  rabbitmqConnect,
  rabbitmqConnectExchange,
  rabbitmqConnectQueue,
  rabbitmqCreateChannel,
} from './GenericFunctions';

jest.mock('amqplib', () => ({
  connect: jest.fn(),
  credentials: { external: jest.fn(() => 'EXTERNAL') },
}));

const connectMock = amqplib.connect as unknown as jest.Mock;

describe('GenericFunctions', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('formatPrivateKey', () => {
    it('returns empty or already formatted keys unchanged', () => {
      expect(formatPrivateKey('')).toBe('');
      expect(formatPrivateKey('a\nb')).toBe('a\nb');
    });

    it('re-inserts line breaks in a single line key', () => {
      const key = '-----BEGIN PRIVATE KEY----- abc def -----END PRIVATE KEY-----';
      expect(formatPrivateKey(key)).toBe('-----BEGIN PRIVATE KEY-----\nabc\ndef\n-----END PRIVATE KEY-----');
    });

    it('supports public keys', () => {
      const key = '-----BEGIN PUBLIC KEY----- abc -----END PUBLIC KEY-----';
      expect(formatPrivateKey(key, true)).toBe('-----BEGIN PUBLIC KEY-----\nabc\n-----END PUBLIC KEY-----');
    });

    it('handles encrypted key headers', () => {
      const key = '-----BEGIN PRIVATE KEY----- Proc-Type: 4,ENCRYPTED DEK-Info: AES,1 abc -----END PRIVATE KEY-----';
      const result = formatPrivateKey(key);
      expect(result).toContain('Proc-Type:4,ENCRYPTED');
      expect(result).toContain('-----END PRIVATE KEY-----');
    });
  });

  describe('rabbitmqConnect', () => {
    it('connects without ssl and maps empty strings to undefined', async () => {
      connectMock.mockResolvedValue('conn');
      const result = await rabbitmqConnect({
        hostname: 'h', port: 5672, username: 'u', password: '', vhost: '/', ssl: false,
      });
      expect(result).toBe('conn');
      expect(connectMock).toHaveBeenCalledWith(
        { hostname: 'h', port: 5672, username: 'u', password: undefined, vhost: '/' },
        {},
      );
    });

    it('uses amqps with a ca for ssl', async () => {
      connectMock.mockResolvedValue('conn');
      await rabbitmqConnect({
        hostname: 'h', port: 1, username: 'u', password: 'p', vhost: '/', ssl: true, ca: 'ca', passwordless: false,
      });
      const [creds, opts] = connectMock.mock.calls[0];
      expect(creds.protocol).toBe('amqps');
      expect(opts.ca[0]).toBeInstanceOf(Buffer);
      expect(opts.cert).toBeUndefined();
    });

    it('supports empty ca and passwordless auth', async () => {
      connectMock.mockResolvedValue('conn');
      await rabbitmqConnect({
        hostname: 'h', port: 1, username: 'u', password: 'p', vhost: '/', ssl: true, ca: '',
        passwordless: true, cert: 'cert', key: 'key', passphrase: 'pp',
      });
      const [, opts] = connectMock.mock.calls[0];
      expect(opts.ca).toBeUndefined();
      expect(opts.cert).toBeInstanceOf(Buffer);
      expect(opts.key).toBeInstanceOf(Buffer);
      expect(opts.passphrase).toBe('pp');
      expect(opts.credentials).toBe('EXTERNAL');
    });

    it('maps empty passwordless values to undefined', async () => {
      connectMock.mockResolvedValue('conn');
      await rabbitmqConnect({
        hostname: 'h', port: 1, username: 'u', password: 'p', vhost: '/', ssl: true, ca: 'ca',
        passwordless: true, cert: '', key: '', passphrase: '',
      });
      const [, opts] = connectMock.mock.calls[0];
      expect(opts.cert).toBeUndefined();
      expect(opts.key).toBeUndefined();
      expect(opts.passphrase).toBeUndefined();
    });
  });

  describe('channel helpers', () => {
    const channel: any = {
      assertQueue: jest.fn(),
      checkQueue: jest.fn(),
      bindQueue: jest.fn(),
      assertExchange: jest.fn(),
      checkExchange: jest.fn(),
    };
    const connection = { on: jest.fn(), createChannel: jest.fn() };
    let ctx: any;

    beforeEach(() => {
      connection.createChannel.mockResolvedValue(channel);
      connectMock.mockResolvedValue(connection);
      ctx = {
        getCredentials: jest.fn().mockResolvedValue({ hostname: 'h', ssl: false }),
        getNodeParameter: jest.fn().mockReturnValue('topic'),
      };
    });

    it('creates a channel', async () => {
      await expect(rabbitmqCreateChannel.call(ctx)).resolves.toBe(channel);
      expect(connection.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('rejects when connecting fails', async () => {
      connectMock.mockRejectedValue(new Error('boom'));
      await expect(rabbitmqCreateChannel.call(ctx)).rejects.toThrow('boom');
    });

    it('asserts a queue and binds it', async () => {
      await rabbitmqConnectQueue.call(ctx, 'q', {
        assertQueue: true,
        binding: { bindings: [{ exchange: 'e', routingKey: 'r' }] },
      } as any);
      expect(channel.assertQueue).toHaveBeenCalledWith('q', expect.anything());
      expect(channel.bindQueue).toHaveBeenCalledWith('q', 'e', 'r');
    });

    it('only checks the queue when assert is disabled', async () => {
      await rabbitmqConnectQueue.call(ctx, 'q', { assertQueue: false } as any);
      expect(channel.checkQueue).toHaveBeenCalledWith('q');
    });

    it('rejects when the queue check fails', async () => {
      channel.checkQueue.mockRejectedValueOnce(new Error('nope'));
      await expect(rabbitmqConnectQueue.call(ctx, 'q', {} as any)).rejects.toThrow('nope');
    });

    it('asserts or checks the exchange', async () => {
      await rabbitmqConnectExchange.call(ctx, 'ex', { assertExchange: true } as any);
      expect(channel.assertExchange).toHaveBeenCalledWith('ex', 'topic', expect.anything());
      await rabbitmqConnectExchange.call(ctx, 'ex', {} as any);
      expect(channel.checkExchange).toHaveBeenCalledWith('ex');
    });

    it('rejects when the exchange check fails', async () => {
      channel.checkExchange.mockRejectedValueOnce(new Error('no ex'));
      await expect(rabbitmqConnectExchange.call(ctx, 'ex', {} as any)).rejects.toThrow('no ex');
    });
  });

  describe('MessageTracker', () => {
    const msg = (tag: number) => ({ fields: { deliveryTag: tag } }) as any;

    it('tracks received and answered messages', () => {
      const tracker = new MessageTracker();
      tracker.answered(msg(1));
      tracker.received(msg(1));
      tracker.received(msg(2));
      expect(tracker.unansweredMessages()).toBe(2);
      tracker.answered(msg(1));
      tracker.answered(msg(99));
      expect(tracker.unansweredMessages()).toBe(1);
    });

    it('closes the channel and waits for pending messages', async () => {
      jest.useFakeTimers();
      const tracker = new MessageTracker();
      tracker.received(msg(1));
      const channel: any = {
        cancel: jest.fn(),
        close: jest.fn(),
        connection: { close: jest.fn() },
      };
      const p = tracker.closeChannel(channel, 'tag');
      await jest.advanceTimersByTimeAsync(1000);
      tracker.answered(msg(1));
      await jest.advanceTimersByTimeAsync(1000);
      await p;
      expect(channel.cancel).toHaveBeenCalledWith('tag');
      expect(channel.close).toHaveBeenCalled();
      expect(channel.connection.close).toHaveBeenCalled();
      // second call is a noop
      await tracker.closeChannel(channel, 'tag');
      expect(channel.cancel).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
  });

  describe('parsePublishArguments', () => {
    it('maps arguments to an object', () => {
      expect(parsePublishArguments({ arguments: { argument: [{ key: 'a', value: '1' }] } } as any)).toEqual({ a: '1' });
      expect(parsePublishArguments({} as any)).toEqual({});
    });
  });

  describe('parseMessage', () => {
    const helpers: any = { prepareBinaryData: jest.fn().mockResolvedValue({ id: 'bin' }) };
    const message = () => ({ content: Buffer.from('{"a":1}'), fields: {} }) as any;

    it('returns binary content', async () => {
      const result = await parseMessage(message(), { contentIsBinary: true } as any, helpers);
      expect(result.binary).toEqual({ data: { id: 'bin' } });
      expect((result.json as any).content).toBeUndefined();
    });

    it('returns only the parsed content', async () => {
      const result = await parseMessage(message(), { contentIsBinary: false, jsonParseBody: true, onlyContent: true } as any, helpers);
      expect(result.json).toEqual({ a: 1 });
    });

    it('returns the whole message with a string content', async () => {
      const result = await parseMessage(message(), { contentIsBinary: false, jsonParseBody: false, onlyContent: false } as any, helpers);
      expect((result.json as any).content).toBe('{"a":1}');
    });
  });
});
