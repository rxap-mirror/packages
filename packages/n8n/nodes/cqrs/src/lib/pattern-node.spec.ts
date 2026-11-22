import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { PatternNode } from './pattern-node';
import { rabbitmqConnectExchange } from './GenericFunctions';

jest.mock('./GenericFunctions', () => ({
  rabbitmqConnectExchange: jest.fn(),
  parsePublishArguments: jest.fn(() => ({})),
}));

const schema = {
  title: 'My Pattern',
  id: 'my-pattern',
  description: 'desc',
  type: 'object',
  properties: {
    'command.one': {
      title: 'One',
      description: 'first',
      type: 'object',
      required: ['a', 'o', 'n'],
      default: { list: [] },
      properties: {
        a: { type: 'string' },
        n: { type: 'number', title: 'N' },
        o: { type: 'object', properties: {} },
        b: { type: 'boolean' },
        id: { type: 'string', format: 'uuid' },
        e: { type: 'string', enum: ['x', 'y'] },
        arr: { type: 'array', items: { type: 'string' } },
        arrAny: { type: 'array' },
        untyped: { description: 'free' },
        nested: { properties: { z: { type: 'string' } } },
        implicitArr: { items: { type: 'number' } },
      },
    },
    'command.two': { type: 'string', default: 'abc' },
    'command.three': { type: 'number' },
    'command.four': { type: 'boolean' },
    'command.five': { type: 'array', items: { type: 'string' } },
    'command.six': {},
    'command.seven': { $ref: '#/x' },
  },
};

class TestNode extends PatternNode {
  constructor(path: string, reply = true) {
    super(path, 'command', reply);
  }
}

function writeSchema(content: unknown) {
  const dir = mkdtempSync(join(tmpdir(), 'cqrs-'));
  const path = join(dir, 'schema.json');
  writeFileSync(path, JSON.stringify(content));
  return path;
}

describe('PatternNode', () => {
  describe('description', () => {
    it('throws for a missing schema file', () => {
      expect(() => new TestNode('/does/not/exist.json')).toThrow('does not exist');
    });

    it('builds the description from the schema', () => {
      const node = new TestNode(writeSchema(schema));
      expect(node.description.name).toBe('my-pattern');
      expect(node.description.displayName).toBe('My Pattern');
      expect(node.description.description).toBe('desc');
      expect(node.description.defaults.name).toBe('TestNode');
      expect(node.description.icon).toEqual({ light: 'file:TestNode.svg', dark: 'file:TestNode.dark.svg' });
      const byName = (n: string) => node.description.properties.filter((p) => p.name === n);
      expect(byName('replyQueue')[0].default).toBe(true);
      const operation = byName('operation')[0] as any;
      expect(operation.default).toBe('command.one');
      expect(operation.options.map((o: any) => o.value)).toContain('__CUSTOM_OPERATION__');
      expect(operation.options[0].name).toBe('One');
      expect(operation.options[1].name).toBe('two');
      expect(byName('spread')).toHaveLength(1);
      expect(byName('pattern')).toHaveLength(1);
      // one payload per object schema pattern plus the custom one
      expect(byName('payload').length).toBe(6);
    });

    it('builds payload properties for every schema type', () => {
      const node = new TestNode(writeSchema(schema));
      const payloads = (node.description.properties as any[]).filter(
        (p) => p.name === 'payload' && p.displayOptions?.show?.operation?.[0] !== '__CUSTOM_OPERATION__');
      const forOp = (op: string) => payloads.find((p) => p.displayOptions.show.operation[0] === op);
      const one = forOp('command.one');
      expect(one.type).toBe('collection');
      expect(one.required).toBe(true);
      expect(one.default).toEqual({ a: null, n: null, o: {} });
      const opt = (name: string) => one.options.find((o: any) => o.name === name);
      expect(opt('a').type).toBe('string');
      expect(opt('n').displayName).toBe('N');
      expect(opt('b').type).toBe('boolean');
      expect(opt('id').default).toMatch(/^[0-9a-f-]{36}$/);
      expect(opt('e').type).toBe('options');
      expect(opt('arr').type).toBe('fixedCollection');
      expect(opt('arrAny').options[0].values[0].type).toBe('json');
      expect(opt('untyped').type).toBe('json');
      expect(opt('nested').type).toBe('collection');
      expect(opt('implicitArr').type).toBe('fixedCollection');
      expect(forOp('command.two').default).toBe('abc');
      expect(forOp('command.three').type).toBe('number');
      expect(forOp('command.four').type).toBe('boolean');
      expect(forOp('command.five').type).toBe('fixedCollection');
      // schemas without a type (incl. reference objects) are skipped
      expect(forOp('command.six')).toBeUndefined();
      expect(forOp('command.seven')).toBeUndefined();
    });

    it('falls back to custom operation and class name without patterns', () => {
      const node = new TestNode(writeSchema({}), false);
      expect(node.description.name).toBe('test-node');
      expect(node.description.displayName).toBe('TestNode');
      const operation = (node.description.properties as any[]).find((p) => p.name === 'operation');
      expect(operation.default).toBe('__CUSTOM_OPERATION__');
      expect(node.description.properties.find((p) => p.name === 'replyQueue')!.default).toBe(false);
    });
  });

  describe('execute', () => {
    let channel: any;
    let params: Record<string, any>;
    let ctx: any;
    let consumer: ((msg: any) => void) | undefined;
    const node = new TestNode(writeSchema(schema));

    beforeEach(() => {
      consumer = undefined;
      channel = {
        publish: jest.fn().mockReturnValue(true),
        consume: jest.fn(async (_q, cb) => { consumer = cb; }),
        close: jest.fn(),
        connection: { close: jest.fn() },
      };
      (rabbitmqConnectExchange as jest.Mock).mockResolvedValue(channel);
      params = { operation: 'command.one', payload: { a: 1 } };
      ctx = {
        getInputData: jest.fn(() => [{ json: {} }]),
        getNodeParameter: jest.fn((name: string, _i: number, def?: any) => name in params ? params[name] : def),
        getNode: jest.fn(() => ({ name: 'n' })),
        continueOnFail: jest.fn(() => false),
        logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
      };
    });

    const reply = (payload: any, correlationId?: string) => {
      const id = correlationId ?? channel.publish.mock.calls[0][3].correlationId;
      consumer!({ properties: { correlationId: id }, content: Buffer.from(JSON.stringify(payload)) });
    };

    it('publishes a message without waiting for a reply', async () => {
      const result = await node.execute.call(ctx);
      expect(channel.publish).toHaveBeenCalledWith('cqrs', 'command.one', Buffer.from('{"a":1}'), expect.objectContaining({ replyTo: undefined }));
      expect(result[0][0].json).toMatchObject({ success: true });
      expect(channel.close).toHaveBeenCalled();
      expect(channel.connection.close).toHaveBeenCalled();
    });

    it('builds the routing key for custom operations and string payloads', async () => {
      params = { operation: '__CUSTOM_OPERATION__', routingKeyPrefix: 'event', pattern: 'foo.bar', payload: 'raw' };
      await node.execute.call(ctx);
      expect(channel.publish).toHaveBeenCalledWith('cqrs', 'event.foo.bar', Buffer.from('raw'), expect.anything());
    });

    it('passes configured headers', async () => {
      params['options'] = { headers: { header: [{ key: 'k', value: 'v' }] } };
      await node.execute.call(ctx);
      expect(channel.publish.mock.calls[0][3].headers).toEqual({ k: 'v' });
    });

    it('throws when connecting to the exchange fails', async () => {
      (rabbitmqConnectExchange as jest.Mock).mockRejectedValue(new Error('down'));
      await expect(node.execute.call(ctx)).rejects.toThrow('Failed to connect to exchange: down');
    });

    it('throws when publishing fails and still closes', async () => {
      channel.publish.mockReturnValue(false);
      await expect(node.execute.call(ctx)).rejects.toThrow('Failed to publish message');
      expect(channel.close).toHaveBeenCalled();
    });

    it('logs when closing the channel fails', async () => {
      channel.close.mockRejectedValue(new Error('close'));
      await node.execute.call(ctx);
      expect(ctx.logger.error).toHaveBeenCalledWith(expect.stringContaining('close'));
    });

    describe('with reply queue', () => {
      beforeEach(() => { params['replyQueue'] = true; });

      const run = async (payload: any, extra: Record<string, any> = {}) => {
        Object.assign(params, extra);
        const p = node.execute.call(ctx);
        await new Promise((r) => setImmediate(r));
        reply(payload);
        return p;
      };

      it('returns the response', async () => {
        const result = await run({ response: { ok: 1 } });
        expect(result[0]).toEqual([{ json: { ok: 1 } }]);
      });

      it('uses the result property', async () => {
        const result = await run({ result: { ok: 2 } });
        expect(result[0]).toEqual([{ json: { ok: 2 } }]);
      });

      it('spreads array responses', async () => {
        const result = await run({ response: [{ a: 1 }, { a: 2 }] }, { spread: true });
        expect(result[0].map((i) => i.json)).toEqual([{ a: 1 }, { a: 2 }]);
      });

      it('spreads rows of an object response', async () => {
        const result = await run({ response: { rows: [{ a: 1 }, { a: 2 }] } }, { spread: true });
        expect(result[0].map((i) => i.json)).toEqual([{ a: 1 }, { a: 2 }]);
      });

      it('falls back to the success item when there is nothing to spread', async () => {
        const result = await run({ response: { foo: 1 } }, { spread: true });
        expect(result[0][0].json).toMatchObject({ success: true });
      });

      it('throws the remote error', async () => {
        await expect(run({ error: { message: 'bad', name: 'E' } })).rejects.toThrow('bad');
      });

      it('returns error items when continueOnFail is enabled', async () => {
        ctx.continueOnFail.mockReturnValue(true);
        const result = await run({ err: { message: 'bad', name: 'E', status: 1 } });
        expect((result[0][0] as any).error).toBeDefined();
      });

      it('returns the raw payload when the structure is unknown', async () => {
        const result = await run({ unexpected: true });
        expect(result[0][0].json).toEqual({ unexpected: true });
      });

      it('ignores empty messages and unrelated correlation ids', async () => {
        const p = node.execute.call(ctx);
        await new Promise((r) => setImmediate(r));
        consumer!(null);
        expect(ctx.logger.warn).toHaveBeenCalledWith('Received empty message');
        reply({ response: { a: 1 } }, 'other');
        reply({ response: { a: 3 } });
        const result = await p;
        expect(result[0]).toEqual([{ json: { a: 3 } }]);
      });
    });
  });
});
