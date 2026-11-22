import { NotImplementedException } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ClientRMQExchange, REPLY_QUEUE } from './client-rmq-exchange';

jest.mock('amqp-connection-manager', () => ({ connect: jest.fn() }));
import { connect } from 'amqp-connection-manager';

const logger = () => ({ log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() });

describe('ClientRMQExchange', () => {
  let log: ReturnType<typeof logger>;
  const options: any = { urls: ['amqp://a', 'amqp://b'], exchange: { name: 'ex', type: 'topic', options: { durable: true } } };
  const make = (o: any = options) => new ClientRMQExchange(o, log as any) as any;

  beforeEach(() => {
    log = logger();
  });

  it('is not unwrappable', () => {
    expect(() => make().unwrap()).toThrow(NotImplementedException);
  });

  it('uses custom serializer and deserializer', () => {
    const serializer = {};
    const deserializer = {};
    const c = make({ ...options, serializer, deserializer });
    expect(c.serializer).toBe(serializer);
    expect(c.deserializer).toBe(deserializer);
  });

  describe('connection lifecycle', () => {
    let manager: any;
    let channelWrapper: any;

    beforeEach(() => {
      manager = Object.assign(new EventEmitter(), {
        isConnected: jest.fn(() => true),
        close: jest.fn(),
        createChannel: jest.fn(),
      });
      channelWrapper = { close: jest.fn(), publish: jest.fn() };
      manager.createChannel.mockReturnValue(channelWrapper);
      (connect as jest.Mock).mockReset().mockReturnValue(manager);
    });

    it('connects, creates the channel and resolves the connection', async () => {
      const c = make({ ...options, socketOptions: { x: 1 } });
      const promise = c.connect();
      expect(connect).toHaveBeenCalledWith(options.urls, { x: 1 });
      manager.emit('connect', { connection: 'conn', url: 'amqp://a' });
      await expect(promise).resolves.toBe('conn');
      expect(manager.createChannel).toHaveBeenCalled();
      // second call reuses the connection
      await expect(c.connect()).resolves.toBe('conn');
      expect(connect).toHaveBeenCalledTimes(1);
      expect(c.isConnected()).toBe(true);
    });

    it('rejects when the connection is lost before it was established', async () => {
      const c = make();
      const promise = c.connect();
      manager.emit('disconnect', { err: new Error('down'), message: 'down', stack: '' });
      await expect(promise).rejects.toBeDefined();
      expect(log.error).toHaveBeenCalled();
    });

    it('retries connectFailed for all but the last url', async () => {
      const c = make();
      const promise = c.connect();
      manager.emit('connectFailed', { url: 'amqp://a', message: 'x', stack: '' });
      manager.emit('connectFailed', { url: 'amqp://b', message: 'y', stack: '' });
      await expect(promise).rejects.toBeDefined();
    });

    it('logs client errors and rejects the pending connection', async () => {
      const c = make();
      const promise = c.connect();
      manager.emit('error', new Error('e'));
      expect(log.error).toHaveBeenCalled();
      await expect(promise).rejects.toThrow('e');
    });

    it('close releases channel and client', async () => {
      const c = make();
      c.connect();
      c.channel = channelWrapper;
      c.close();
      expect(channelWrapper.close).toHaveBeenCalled();
      expect(manager.close).toHaveBeenCalled();
      expect(c.client).toBeNull();
      expect(c.isConnected()).toBeNull();
    });

    it('createChannel resolves once the exchange is set up', async () => {
      const c = make();
      c.client = manager;
      const ch = { assertExchange: jest.fn(async () => undefined), consume: jest.fn<any, any[]>(async () => undefined) };
      manager.createChannel.mockImplementation(({ setup }: any) => {
        setup(ch);
        return channelWrapper;
      });
      await c.createChannel();
      expect(ch.assertExchange).toHaveBeenCalledWith('ex', 'topic', { durable: true });
      expect(ch.consume.mock.calls[0][0]).toBe(REPLY_QUEUE);
    });
  });

  describe('exchange setup', () => {
    it('skips the assertion with noAssert', async () => {
      const c = make({ ...options, noAssert: true, replyQueue: 'rq' });
      c.responseEmitter = new EventEmitter();
      const ch = { assertExchange: jest.fn(), consume: jest.fn<any, any[]>(async () => undefined) };
      const resolve = jest.fn();
      await c.setupExchange(ch, resolve);
      expect(ch.assertExchange).not.toHaveBeenCalled();
      expect(ch.consume.mock.calls[0][0]).toBe('rq');
      expect(resolve).toHaveBeenCalled();
    });

    it('forwards consumed messages by correlation id', async () => {
      const c = make();
      c.responseEmitter = new EventEmitter();
      const ch = { consume: jest.fn<any, any[]>(async () => undefined) };
      await c.consumeChannel(ch);
      const handler = ch.consume.mock.calls[0][1];
      const received = jest.fn();
      c.responseEmitter.on('id', received);
      handler({ properties: { correlationId: 'id' } });
      expect(received).toHaveBeenCalled();
      handler(null);
      expect(log.warn).toHaveBeenCalled();
    });
  });

  describe('publish / dispatchEvent', () => {
    const setup = (publishResult: Promise<any> | (() => any) = Promise.resolve()) => {
      const c = make({ ...options, headers: { base: '1' }, persistent: true });
      c.responseEmitter = new EventEmitter();
      c.channel = {
        publish: jest.fn((...args: any[]) =>
          typeof publishResult === 'function' ? publishResult() : publishResult,
        ),
      };
      return c;
    };

    it('publishes with correlation id, reply queue and merged headers', () => {
      const c = setup();
      const unsubscribe = c.publish({ pattern: 'rk', data: { a: 1 } }, jest.fn());
      const [exchange, routingKey, buffer, opts] = c.channel.publish.mock.calls[0];
      expect(exchange).toBe('ex');
      expect(routingKey).toBe('rk');
      expect(JSON.parse(buffer.toString())).toEqual({ a: 1 });
      expect(opts.replyTo).toBe(REPLY_QUEUE);
      expect(opts.headers).toEqual({ base: '1' });
      expect(opts.persistent).toBe(true);
      expect(c.responseEmitter.listenerCount(opts.correlationId)).toBe(1);
      unsubscribe();
      expect(c.responseEmitter.listenerCount(opts.correlationId)).toBe(0);
    });

    it('routes replies to the callback', async () => {
      const c = setup();
      const callback = jest.fn();
      c.publish({ pattern: 'rk', data: 1 }, callback);
      const id = c.channel.publish.mock.calls[0][3].correlationId;
      c.responseEmitter.emit(id, { content: Buffer.from('{"response":"ok","isDisposed":true}'), fields: {}, properties: {} });
      await new Promise((r) => setTimeout(r, 5));
      expect(callback).toHaveBeenCalledWith({ err: undefined, response: 'ok', isDisposed: true });
    });

    it('reports publish failures through the callback', async () => {
      const c = setup(Promise.reject(new Error('fail')));
      const callback = jest.fn();
      c.publish({ pattern: 'rk', data: 1 }, callback);
      await new Promise((r) => setTimeout(r, 5));
      expect(callback).toHaveBeenCalledWith({ err: expect.objectContaining({ message: 'fail' }) });
    });

    it('reports synchronous failures through the callback', () => {
      const c = setup(() => {
        throw new Error('sync');
      });
      const callback = jest.fn();
      const unsubscribe = c.publish({ pattern: 'rk', data: 1 }, callback);
      expect(callback).toHaveBeenCalledWith({ err: expect.objectContaining({ message: 'sync' }) });
      expect(unsubscribe()).toBeUndefined();
    });

    it('dispatchEvent resolves or rejects based on the publish callback', async () => {
      const c = setup();
      c.channel.publish = jest.fn((...args: any[]) => args[4](undefined));
      await expect(c.dispatchEvent({ pattern: 'rk', data: 1 })).resolves.toBeUndefined();
      c.channel.publish = jest.fn((...args: any[]) => args[4](new Error('nack')));
      await expect(c.dispatchEvent({ pattern: 'rk', data: 1 })).rejects.toThrow('nack');
    });
  });

  describe('handleMessage', () => {
    it('requires a callback', async () => {
      const c = make();
      c.deserializer = { deserialize: jest.fn(async () => ({})) };
      await expect(c.handleMessage({}, {})).rejects.toThrow('No callback provided');
    });

    it('signals disposal first when the response is disposed or an error', async () => {
      const c = make();
      c.deserializer = { deserialize: jest.fn(async () => ({ err: new Error('x'), response: undefined })) };
      const cb = jest.fn();
      await c.handleMessage({}, cb);
      expect(cb).toHaveBeenCalledTimes(2);
      expect(cb.mock.calls[0][0].isDisposed).toBe(true);
    });
  });

  describe('helpers', () => {
    it('mergeHeaders', () => {
      expect(make({ ...options }).mergeHeaders()).toBeUndefined();
      expect(make({ ...options }).mergeHeaders({ a: '1' })).toEqual({ a: '1' });
      expect(make({ ...options, headers: { a: '0', b: '2' } }).mergeHeaders({ a: '1' })).toEqual({ a: '1', b: '2' });
    });

    it('parseMessageContent falls back to the raw string', () => {
      const c = make();
      expect(c.parseMessageContent(Buffer.from('{"a":1}'))).toEqual({ a: 1 });
      expect(c.parseMessageContent(Buffer.from('hello'))).toBe('hello');
    });
  });
});
