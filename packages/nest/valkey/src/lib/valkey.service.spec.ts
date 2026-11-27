import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { VALKEY_MODULE_OPTIONS } from './tokens';
import { ValkeyService } from './valkey.service';

const mockRedisInstance = {
  get: jest.fn(),
  mget: jest.fn(),
  incr: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  ping: jest.fn(),
  on: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => mockRedisInstance),
}));

async function setup(
  options: Record<string, unknown> = { host: 'localhost', port: 6379 }
): Promise<ValkeyService> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    providers: [
      ValkeyService,
      { provide: VALKEY_MODULE_OPTIONS, useValue: options },
    ],
  }).compile();
  return moduleRef.get(ValkeyService);
}

describe('ValkeyService', () => {
  let service: ValkeyService;

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await setup();
  });

  describe('get', () => {
    it('returns the parsed value on a hit', async () => {
      mockRedisInstance.get.mockResolvedValue(JSON.stringify({ a: 1 }));

      await expect(service.get('key')).resolves.toEqual({ a: 1 });
    });

    it('returns undefined on a miss', async () => {
      mockRedisInstance.get.mockResolvedValue(null);

      await expect(service.get('key')).resolves.toBeUndefined();
    });

    it('fails closed (returns undefined) when the client throws', async () => {
      mockRedisInstance.get.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.get('key')).resolves.toBeUndefined();
    });
  });

  describe('mget', () => {
    it('parses every value in key order, undefined for a missing key', async () => {
      mockRedisInstance.mget.mockResolvedValue(['{"a":1}', null, '3']);

      await expect(service.mget(['k1', 'k2', 'k3'])).resolves.toEqual([
        { a: 1 },
        undefined,
        3,
      ]);
      expect(mockRedisInstance.mget).toHaveBeenCalledWith('k1', 'k2', 'k3');
    });

    it('does not fail closed: an error propagates', async () => {
      mockRedisInstance.mget.mockRejectedValue(new Error('down'));

      await expect(service.mget(['k1', 'k2'])).rejects.toThrow('down');
    });

    it('does not call Valkey for no keys', async () => {
      await expect(service.mget([])).resolves.toEqual([]);
      expect(mockRedisInstance.mget).not.toHaveBeenCalled();
    });
  });

  describe('incr', () => {
    it('returns the incremented value', async () => {
      mockRedisInstance.incr.mockResolvedValue(4);

      await expect(service.incr('gen')).resolves.toBe(4);
      expect(mockRedisInstance.incr).toHaveBeenCalledWith('gen');
    });

    it('does NOT fail closed: an error propagates', async () => {
      mockRedisInstance.incr.mockRejectedValue(new Error('down'));

      await expect(service.incr('gen')).rejects.toThrow('down');
    });
  });

  describe('set', () => {
    it('serializes the value and applies a TTL when given', async () => {
      await service.set('key', { a: 1 }, 60);

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ a: 1 }),
        'EX',
        60
      );
    });

    it('omits the TTL when not given', async () => {
      await service.set('key', { a: 1 });

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ a: 1 })
      );
    });

    it('fails closed (does not throw) when the client throws', async () => {
      mockRedisInstance.set.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.set('key', { a: 1 })).resolves.toBeUndefined();
    });
  });

  describe('del', () => {
    it('deletes the key', async () => {
      await service.del('key');

      expect(mockRedisInstance.del).toHaveBeenCalledWith('key');
    });

    it('fails closed (does not throw) when the client throws', async () => {
      mockRedisInstance.del.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.del('key')).resolves.toBeUndefined();
    });
  });

  describe('delStrict', () => {
    // The 'del' suite above leaves a mockRejectedValue on mockRedisInstance.del
    // (jest.clearAllMocks() clears call state, not implementations) — reset it
    // so these tests don't inherit that failure.
    beforeEach(() => {
      mockRedisInstance.del.mockReset();
    });

    it('deletes the key', async () => {
      await service.delStrict('key');

      expect(mockRedisInstance.del).toHaveBeenCalledWith('key');
    });

    it('does NOT fail closed — propagates the error when the client throws', async () => {
      mockRedisInstance.del.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.delStrict('key')).rejects.toThrow('ECONNREFUSED');
    });
  });

  describe('ping', () => {
    it('delegates to the underlying client without swallowing errors', async () => {
      mockRedisInstance.ping.mockResolvedValue('PONG');

      await expect(service.ping()).resolves.toBe('PONG');
    });
  });

  describe('connection options', () => {
    const RedisMock = Redis as unknown as jest.Mock;
    // the outer beforeEach already built one service; assert on the latest construction
    const lastCall = () => RedisMock.mock.calls[RedisMock.mock.calls.length - 1];

    it('uses host/port/password without a url', async () => {
      await setup({ host: 'valkey', port: 7000, password: 'pw' });

      expect(RedisMock).toHaveBeenCalledWith(
        expect.objectContaining({ host: 'valkey', port: 7000, password: 'pw' })
      );
    });

    it('defaults to localhost:6379 and no password', async () => {
      await setup({});

      const opts = lastCall()[0];
      expect(opts).toMatchObject({ host: 'localhost', port: 6379 });
      expect(opts.password).toBeUndefined();
      expect(opts.tls).toBeUndefined();
    });

    it('lets the url win over host/port', async () => {
      await setup({ url: 'redis://:pw@other:6380/2', host: 'ignored', port: 1 });

      const [url, opts] = lastCall();
      expect(url).toBe('redis://:pw@other:6380/2');
      expect(opts).not.toHaveProperty('host');
      expect(opts).not.toHaveProperty('port');
    });

    it('lets an explicit password override the url password', async () => {
      await setup({ url: 'redis://:old@h', password: 'new' });

      expect(lastCall()[1]).toMatchObject({ password: 'new' });
    });

    it('treats an empty url as unset', async () => {
      await setup({ url: '', host: 'h', port: 1 });

      expect(lastCall()[0]).toMatchObject({ host: 'h', port: 1 });
    });

    it('enables TLS for tls: true', async () => {
      await setup({ host: 'h', tls: true });

      expect(lastCall()[0].tls).toEqual({});
    });

    it('passes TLS connection options through', async () => {
      await setup({ host: 'h', tls: { rejectUnauthorized: false } });

      expect(lastCall()[0].tls).toEqual({ rejectUnauthorized: false });
    });

    it('enables TLS together with a url', async () => {
      await setup({ url: 'redis://h:6379', tls: true });

      expect(lastCall()[1].tls).toEqual({});
    });

    it('keeps the bounded retry settings', async () => {
      await setup({});

      expect(lastCall()[0]).toMatchObject({ maxRetriesPerRequest: 1 });
      expect(lastCall()[0].retryStrategy(1)).toBe(500);
      expect(lastCall()[0].retryStrategy(100)).toBe(5000);
    });
  });

  describe('client', () => {
    it('exposes the raw ioredis client', () => {
      expect(service.client).toBe(mockRedisInstance);
    });

    it('is readonly at type level', () => {
      // @ts-expect-error client must not be reassignable
      service.client = mockRedisInstance;
    });
  });

  describe('error logging', () => {
    it('logs connection errors without leaking the password', async () => {
      const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      await setup({ url: 'redis://user:s3cret@h:6379', password: 'pw123' });

      const handler = [...mockRedisInstance.on.mock.calls].reverse().find(([e]) => e === 'error')![1];
      handler(new Error('failed redis://user:s3cret@h:6379 AUTH pw123'));

      const logged = warn.mock.calls.map((c) => String(c[0])).join('\n');
      expect(logged).toContain('Valkey connection error');
      expect(logged).not.toContain('s3cret');
      expect(logged).not.toContain('pw123');
      warn.mockRestore();
    });

    it('does not leak the password in cache failure logs', async () => {
      const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      const svc = await setup({ password: 'pw123' });
      mockRedisInstance.get.mockRejectedValue(new Error('NOAUTH pw123'));

      await svc.get('k');

      expect(warn.mock.calls.map((c) => String(c[0])).join('')).not.toContain('pw123');
      warn.mockRestore();
    });
  });

  describe('shutdown', () => {
    it('disconnects the client', () => {
      service.onApplicationShutdown();

      expect(mockRedisInstance.disconnect).toHaveBeenCalled();
    });
  });
});
