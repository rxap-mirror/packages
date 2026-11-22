import { NotImplementedException } from '@nestjs/common';
import { EventEmitter } from 'events';
import { of, throwError } from 'rxjs';
import { ServerRMQ } from './server-rmq';

jest.mock('amqp-connection-manager', () => ({ connect: jest.fn() }));
import { connect } from 'amqp-connection-manager';

const logger = () => ({
  log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn(),
});

function fakeChannel() {
  return {
    assertExchange: jest.fn(async () => undefined),
    assertQueue: jest.fn(async () => ({ queue: 'q-generated' })),
    prefetch: jest.fn(async () => undefined),
    consume: jest.fn(),
    close: jest.fn(),
    bindQueue: jest.fn(async () => undefined),
    nack: jest.fn(),
    sendToQueue: jest.fn(),
  };
}

describe('ServerRMQ', () => {
  let log: ReturnType<typeof logger>;
  const make = (options: any = {}) => new ServerRMQ({ urls: ['amqp://x'], ...options }, log as any);

  beforeEach(() => {
    log = logger();
  });

  it('is not unwrappable and has no event api', () => {
    const s = make();
    expect(() => s.unwrap()).toThrow(NotImplementedException);
    expect(() => s.on()).toThrow(NotImplementedException);
  });

  it('uses custom serializer and deserializer when provided', () => {
    const serializer = { serialize: jest.fn() };
    const deserializer = { deserialize: jest.fn() };
    const s: any = make({ serializer, deserializer });
    expect(s.serializer).toBe(serializer);
    expect(s.deserializer).toBe(deserializer);
  });

  describe('start / connection handling', () => {
    let manager: EventEmitter & { createChannel: jest.Mock; close: jest.Mock };
    let channel: any;

    beforeEach(() => {
      manager = Object.assign(new EventEmitter(), { createChannel: jest.fn(), close: jest.fn() });
      channel = { close: jest.fn() };
      manager.createChannel.mockReturnValue(channel);
      (connect as jest.Mock).mockReset().mockReturnValue(manager);
    });

    it('creates a channel once connected', async () => {
      const s: any = make({ socketOptions: { a: 1 } });
      await s.start();
      expect(connect).toHaveBeenCalledWith(['amqp://x'], { a: 1 });
      manager.emit('connect');
      manager.emit('connect');
      expect(manager.createChannel).toHaveBeenCalledTimes(1);
      const setup = manager.createChannel.mock.calls[0][0].setup;
      const cb = jest.fn();
      const ch = fakeChannel();
      await setup(ch, cb);
    });

    it('logs errors and disconnects', async () => {
      const s: any = make();
      await s.start();
      manager.emit('error', new Error('e'));
      manager.emit('disconnect', new Error('d'));
      expect(log.error).toHaveBeenCalledTimes(2);
    });

    it('listen forwards start errors to the callback', async () => {
      (connect as jest.Mock).mockImplementation(() => {
        throw new Error('no connect');
      });
      const cb = jest.fn();
      await make().listen(cb);
      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ message: 'no connect' }));
    });

    it('stops after the maximum number of connection attempts', async () => {
      const s: any = make({ maxConnectionAttempts: 2 });
      const cb = jest.fn();
      await s.start(cb);
      manager.emit('connectFailed', { err: new Error('x') });
      expect(cb).not.toHaveBeenCalled();
      manager.emit('connectFailed', {});
      expect(cb).toHaveBeenCalledTimes(1);
      expect(manager.close).toHaveBeenCalled();
    });

    it('never gives up with infinite attempts or when reconnecting', async () => {
      const s: any = make();
      const cb = jest.fn();
      await s.start(cb);
      for (let i = 0; i < 3; i++) manager.emit('connectFailed', {});
      expect(cb).not.toHaveBeenCalled();
      const s2: any = make({ maxConnectionAttempts: 1 });
      await s2.start(cb);
      manager.emit('connect');
      manager.emit('connectFailed', {});
      expect(cb).not.toHaveBeenCalled();
    });

    it('close closes channel and connection', async () => {
      const s: any = make();
      await s.start();
      manager.emit('connect');
      s.close();
      expect(channel.close).toHaveBeenCalled();
      expect(manager.close).toHaveBeenCalled();
      expect(() => make().close()).not.toThrow();
    });
  });

  describe('setupChannel', () => {
    it('asserts exchanges and queue and starts consuming', async () => {
      const s: any = make({
        exchange: [{ name: 'e1', type: 'topic' }, { name: 'e2', type: 'fanout' }],
        queue: 'q', prefetchCount: 3, noAck: false, consumerTag: 'tag',
      });
      const ch = fakeChannel();
      const cb = jest.fn();
      await s.setupChannel(ch, cb);
      expect(ch.assertExchange).toHaveBeenCalledTimes(2);
      expect(ch.assertQueue).toHaveBeenCalledWith('q', undefined);
      expect(s.queue).toBe('q-generated');
      expect(ch.prefetch).toHaveBeenCalledWith(3, undefined);
      expect(ch.consume.mock.calls[0][0]).toBe('q-generated');
      expect(ch.consume.mock.calls[0][2]).toEqual({ prefetch: 3, noAck: false, consumerTag: 'tag' });
      expect(cb).toHaveBeenCalled();
    });

    it('skips assertions with noAssert', async () => {
      const s: any = make({ noAssert: true, queue: 'q' });
      const ch = fakeChannel();
      await s.setupChannel(ch);
      expect(ch.assertQueue).not.toHaveBeenCalled();
      expect(s.queue).toBe('q');
      expect(ch.consume.mock.calls[0][2]).toMatchObject({ noAck: true, prefetch: 0 });
    });

    it('routes consumed messages to handleMessage', async () => {
      const s: any = make({ noAssert: true });
      s.handleMessage = jest.fn();
      const ch = fakeChannel();
      await s.setupChannel(ch);
      ch.consume.mock.calls[0][1]({ id: 1 });
      expect(s.handleMessage).toHaveBeenCalledWith({ id: 1 }, ch);
    });
  });

  it('bindQueue binds the queue to the exchange', async () => {
    const s: any = make();
    s.channel = fakeChannel();
    s.queue = 'q';
    await s.bindQueue('ex', 'rk');
    expect(s.channel.bindQueue).toHaveBeenCalledWith('q', 'ex', 'rk');
  });

  describe('handleMessage', () => {
    const message = (content: any, props: any = {}, fields: any = { routingKey: 'rk' }) => ({
      content: Buffer.from(typeof content === 'string' ? content : JSON.stringify(content)),
      properties: { replyTo: 'reply', correlationId: 'c1', ...props },
      fields,
    });
    const make2 = (options: any = {}) => {
      const s: any = make(options);
      s.channel = fakeChannel();
      return s;
    };

    it('ignores nil messages', async () => {
      const s = make2();
      await expect(s.handleMessage(null, {})).resolves.toBeUndefined();
    });

    it('handles events without correlation id', async () => {
      const s = make2();
      const handler: any = jest.fn(async () => undefined);
      handler.isEventHandler = true;
      s.messageHandlers.set('rk', handler);
      await s.handleMessage(message({ pattern: 'rk', data: 1 }), s.channel);
      expect(handler).toHaveBeenCalledWith(1, expect.anything());
    });

    it('calls the message handler and replies', async () => {
      const s = make2();
      s.messageHandlers.set('rk', jest.fn(async (data: any) => ({ echoed: data })));
      await s.handleMessage(message({ hello: 'w' }), s.channel);
      await new Promise((r) => setTimeout(r, 10));
      expect(s.channel.sendToQueue).toHaveBeenCalled();
      const [queue, buffer, opts] = s.channel.sendToQueue.mock.calls[0];
      expect(queue).toBe('reply');
      expect(opts.correlationId).toBe('c1');
      expect(JSON.parse(buffer.toString())).toMatchObject({ response: { echoed: { hello: 'w' } } });
    });

    it('answers with an error when no handler exists', async () => {
      const s = make2();
      await s.handleMessage(message({ hello: 'w' }), s.channel);
      const [, buffer] = s.channel.sendToQueue.mock.calls[0];
      expect(JSON.parse(buffer.toString()).err).toBeDefined();
      expect(s.channel.nack).not.toHaveBeenCalled();
    });

    it('nacks messages without handler when acks are required', async () => {
      const s = make2({ noAck: false });
      await s.handleMessage(message('plain text'), s.channel);
      expect(s.channel.nack).toHaveBeenCalled();
      expect(log.warn).toHaveBeenCalled();
    });
  });

  describe('handleEvent', () => {
    it('nacks events without a handler when acks are required', async () => {
      const s: any = make({ noAck: false });
      s.channel = fakeChannel();
      await s.handleEvent('p', { pattern: 'p', data: 1 }, { getMessage: () => 'm' });
      expect(s.channel.nack).toHaveBeenCalledWith('m', false, false);
      expect(log.warn).toHaveBeenCalled();
    });

    it('delegates to the base implementation otherwise', async () => {
      const s: any = make();
      s.logger = log;
      await s.handleEvent('p', { pattern: 'p', data: 1 }, {});
      expect(log.error).toHaveBeenCalled();
    });
  });

  describe('send', () => {
    it('serializes errors and always disposes', async () => {
      const s: any = make();
      const respond = jest.fn();
      s.send(throwError(() => new Error('bad')), respond);
      await new Promise((r) => setTimeout(r, 10));
      expect(respond.mock.calls[0][0].err.message).toBe('bad');
      expect(respond.mock.calls.some((c) => c[0].isDisposed)).toBe(true);
    });

    it('buffers emitted values and marks the last as disposed', async () => {
      const s: any = make();
      const respond = jest.fn();
      s.send(of(1, 2), respond);
      await new Promise((r) => setTimeout(r, 10));
      expect(respond.mock.calls.map((c) => c[0])).toEqual([{ response: 1 }, { response: 2, isDisposed: true }]);
    });
  });

  it('addHandler logs and registers the handler', () => {
    const s: any = make();
    s.addHandler('p', jest.fn());
    expect(log.log).toHaveBeenCalled();
    expect(s.getHandlerByPattern('p')).toBeDefined();
  });
});
