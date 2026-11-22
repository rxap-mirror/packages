import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { PatternTriggerNode } from './pattern-trigger-node';
import { parseMessage, rabbitmqCreateChannel } from './GenericFunctions';

const closeChannel = jest.fn();

jest.mock('./GenericFunctions', () => ({
  rabbitmqCreateChannel: jest.fn(),
  parseMessage: jest.fn(),
  MessageTracker: jest.fn().mockImplementation(() => ({
    received: jest.fn(),
    answered: jest.fn(),
    closeChannel: (...args: any[]) => closeChannel(...args),
  })),
}));

class MyTrigger extends PatternTriggerNode {
  constructor(path: string) {
    super(path, 'event');
  }
}

function writeSchema(content: unknown) {
  const path = join(mkdtempSync(join(tmpdir(), 'cqrs-trigger-')), 'schema.json');
  writeFileSync(path, JSON.stringify(content));
  return path;
}

describe('PatternTriggerNode', () => {
  it('throws for a missing schema file', () => {
    expect(() => new MyTrigger('/missing.json')).toThrow('does not exist');
  });

  it('builds the description', () => {
    const node = new MyTrigger(writeSchema({
      title: 'Evt', id: 'evt', description: 'd',
      properties: { 'event.a': { title: 'A', description: 'x' }, 'event.b': {} },
    }));
    expect(node.description.name).toBe('evtTrigger');
    expect(node.description.displayName).toBe('Evt Trigger');
    expect(node.description.icon).toEqual({ light: 'file:My.svg', dark: 'file:My.dark.svg' });
    const op = (node.description.properties as any[]).find((p) => p.name === 'operation');
    expect(op.default).toBe('event.a');
    expect(op.options.map((o: any) => o.name)).toEqual(['A', 'b', 'Custom']);
    expect(node.description.properties.map((p) => p.name)).toEqual(
      expect.arrayContaining(['queue', 'pattern', 'options', 'routingKeyPrefix']));
  });

  it('falls back to the class name', () => {
    const node = new MyTrigger(writeSchema({}));
    expect(node.description.displayName).toBe('MyTrigger Trigger');
    expect((node.description.properties as any[]).find((p) => p.name === 'operation').default)
      .toBe('__CUSTOM_OPERATION__');
  });

  describe('trigger', () => {
    const node = new MyTrigger(writeSchema({ properties: { 'event.a': {} } }));
    let channel: any;
    let params: Record<string, any>;
    let ctx: any;
    let consume: (m: any) => Promise<void>;

    beforeEach(() => {
      jest.clearAllMocks();
      channel = {
        assertQueue: jest.fn(),
        assertExchange: jest.fn(),
        bindQueue: jest.fn(),
        prefetch: jest.fn(),
        get: jest.fn(),
        consume: jest.fn(async (_q, cb) => { consume = cb; return { consumerTag: 'ct' }; }),
        ack: jest.fn(),
        nack: jest.fn(),
        on: jest.fn(),
        close: jest.fn(),
        connection: { close: jest.fn() },
      };
      (rabbitmqCreateChannel as jest.Mock).mockResolvedValue(channel);
      (parseMessage as jest.Mock).mockResolvedValue({ json: { x: 1 } });
      params = { queue: 'q', operation: 'event.a', options: {} };
      ctx = {
        getNodeParameter: jest.fn((name: string, def?: any) => name in params ? params[name] : def),
        getMode: jest.fn(() => 'trigger'),
        getNode: jest.fn(() => ({ name: 'n' })),
        getWorkflow: jest.fn(() => ({ id: 'w' })),
        helpers: { createDeferredPromise: jest.fn() },
        emit: jest.fn(),
        emitError: jest.fn(),
        logger: { error: jest.fn() },
      };
    });

    it('asserts and binds with a custom routing key', async () => {
      params['operation'] = '__CUSTOM_OPERATION__';
      params['routingKeyPrefix'] = 'event';
      params['pattern'] = 'foo';
      await node.trigger.call(ctx);
      expect(channel.assertExchange).toHaveBeenCalledWith('cqrs', 'topic', { durable: false, autoDelete: false });
      expect(channel.bindQueue).toHaveBeenCalledWith('q', 'cqrs', 'event.foo');
    });

    describe('manual mode', () => {
      beforeEach(() => { ctx.getMode.mockReturnValue('manual'); });

      it('emits an existing message', async () => {
        channel.get.mockResolvedValue({ m: 1 });
        const res: any = await node.trigger.call(ctx);
        await res.manualTriggerFunction();
        expect(channel.prefetch).toHaveBeenCalledWith(1);
        expect(channel.ack).toHaveBeenCalled();
        expect(ctx.emit).toHaveBeenCalledWith([[{ json: { x: 1 } }]]);
        await res.closeFunction();
        expect(channel.close).toHaveBeenCalled();
      });

      it('waits for a message when the queue is empty', async () => {
        channel.get.mockResolvedValue(false);
        const res: any = await node.trigger.call(ctx);
        await res.manualTriggerFunction();
        await consume({ m: 2 });
        expect(ctx.emit).toHaveBeenCalled();
        await consume(null);
        expect(ctx.emitError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it.each([0, -2, NaN])('rejects the invalid parallel limit %s', async (limit) => {
      params['options'] = { parallelMessages: limit };
      await expect(node.trigger.call(ctx)).rejects.toThrow('Parallel message processing limit');
    });

    it('acknowledges immediately', async () => {
      const res: any = await node.trigger.call(ctx);
      await consume({ fields: {} });
      expect(ctx.emit).toHaveBeenCalledWith([[{ json: { x: 1 } }]], undefined, undefined);
      expect(channel.ack).toHaveBeenCalled();
      await consume(null);
      expect(channel.on).toHaveBeenCalledWith('close', expect.any(Function));
      await res.closeFunction();
      expect(closeChannel).toHaveBeenCalledWith(channel, 'ct');
    });

    it('reports unexpected channel closes only before closeFunction', async () => {
      const res: any = await node.trigger.call(ctx);
      const onClose = channel.on.mock.calls[0][1];
      onClose();
      expect(ctx.emitError).toHaveBeenCalledTimes(1);
      await res.closeFunction();
      onClose();
      expect(ctx.emitError).toHaveBeenCalledTimes(1);
    });

    it('logs errors while closing', async () => {
      closeChannel.mockRejectedValueOnce(new Error('x'));
      const res: any = await node.trigger.call(ctx);
      await res.closeFunction();
      expect(ctx.logger.error).toHaveBeenCalledWith(expect.stringContaining('closing'), expect.anything());
    });

    it('sets the prefetch and defaults to executionFinishes with a parallel limit', async () => {
      params['options'] = { parallelMessages: 3 };
      const deferred = { promise: Promise.resolve({ data: { resultData: {} } }) };
      ctx.helpers.createDeferredPromise.mockReturnValue(deferred);
      await node.trigger.call(ctx);
      expect(channel.prefetch).toHaveBeenCalledWith(3);
      await consume({ fields: {} });
      expect(ctx.emit).toHaveBeenCalledWith([[{ json: { x: 1 } }]], undefined, deferred);
      expect(channel.ack).toHaveBeenCalled();
    });

    it('nacks failed executions with executionFinishesSuccessfully', async () => {
      params['options'] = { acknowledge: 'executionFinishesSuccessfully' };
      ctx.helpers.createDeferredPromise.mockReturnValue({ promise: Promise.resolve({ data: { resultData: { error: {} } } }) });
      await node.trigger.call(ctx);
      await consume({ fields: {} });
      expect(channel.nack).toHaveBeenCalled();
      expect(channel.ack).not.toHaveBeenCalled();
    });

    it('acks failed executions with executionFinishes', async () => {
      params['options'] = { acknowledge: 'executionFinishes' };
      ctx.helpers.createDeferredPromise.mockReturnValue({ promise: Promise.resolve({ data: { resultData: { error: {} } } }) });
      await node.trigger.call(ctx);
      await consume({ fields: {} });
      expect(channel.ack).toHaveBeenCalled();
    });

    it('acks after a later message node', async () => {
      params['options'] = { acknowledge: 'laterMessageNode' };
      const deferred = { promise: Promise.resolve() };
      ctx.helpers.createDeferredPromise.mockReturnValue(deferred);
      await node.trigger.call(ctx);
      await consume({ fields: {} });
      expect(ctx.emit).toHaveBeenCalledWith([[{ json: { x: 1 } }]], deferred, undefined);
      expect(channel.ack).toHaveBeenCalled();
    });

    it('logs message processing errors', async () => {
      params['options'] = { acknowledge: 'executionFinishes' };
      (parseMessage as jest.Mock).mockRejectedValue(new Error('parse'));
      await node.trigger.call(ctx);
      await consume({ fields: {} });
      expect(ctx.logger.error).toHaveBeenCalledWith(expect.stringContaining('parse'), expect.anything());
    });
  });
});
