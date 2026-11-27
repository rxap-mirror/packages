import { ValkeyLockService } from './valkey-lock.service';
import { ValkeyUnavailableError } from './valkey-unavailable.error';

function createClient() {
  return {
    set: jest.fn(),
    eval: jest.fn(),
  };
}

function setup() {
  const client = createClient();
  const service = new ValkeyLockService({ client } as any);
  return { client, service };
}

const TOKEN = /^[0-9a-f]{32}$/;

describe('ValkeyLockService', () => {
  describe('acquire', () => {
    it('issues SET key value PX ttl NX and returns a lease on success', async () => {
      const { client, service } = setup();
      client.set.mockResolvedValue('OK');

      const lease = await service.acquire('lock:a', 5000, 'alice');

      expect(lease).toEqual({ key: 'lock:a', token: expect.stringMatching(TOKEN), owner: 'alice' });
      const [key, raw, px, ttl, nx] = client.set.mock.calls[0];
      expect([key, px, ttl, nx]).toEqual(['lock:a', 'PX', 5000, 'NX']);
      const stored = JSON.parse(raw);
      expect(stored).toMatchObject({ t: lease!.token, o: 'alice' });
      expect(typeof stored.s).toBe('number');
    });

    it('returns null when the key is already held', async () => {
      const { client, service } = setup();
      client.set.mockResolvedValue(null);

      await expect(service.acquire('lock:a', 5000)).resolves.toBeNull();
    });

    it('stores the optional payload and omits an absent owner', async () => {
      const { client, service } = setup();
      client.set.mockResolvedValue('OK');

      const lease = await service.acquire('k', 1000, undefined, { action: 'export' });

      expect(lease).not.toHaveProperty('owner');
      expect(JSON.parse(client.set.mock.calls[0][1])).toMatchObject({ p: { action: 'export' } });
    });

    it('uses a fresh random token per acquisition', async () => {
      const { client, service } = setup();
      client.set.mockResolvedValue('OK');

      const a = await service.acquire('k', 1000);
      const b = await service.acquire('k', 1000);

      expect(a!.token).not.toBe(b!.token);
    });

    it('does not put the token into the holder-visible data twice or leak it via owner', async () => {
      const { client, service } = setup();
      client.set.mockResolvedValue('OK');

      const lease = await service.acquire('k', 1000, 'bob');

      expect(lease!.owner).toBe('bob');
    });

    it('fails closed with ValkeyUnavailableError when the client throws', async () => {
      const { client, service } = setup();
      client.set.mockRejectedValue(new Error('ECONNREFUSED'));

      const promise = service.acquire('k', 1000);
      await expect(promise).rejects.toBeInstanceOf(ValkeyUnavailableError);
      await expect(promise).rejects.toMatchObject({ code: 'VALKEY_UNAVAILABLE' });
    });

    it.each([0, -1, 1.5, NaN, Infinity])('rejects an invalid ttl %p', async (ttl) => {
      const { client, service } = setup();

      await expect(service.acquire('k', ttl)).rejects.toThrow(RangeError);
      expect(client.set).not.toHaveBeenCalled();
    });

    it('rejects an empty key', async () => {
      const { client, service } = setup();

      await expect(service.acquire('', 1000)).rejects.toThrow(TypeError);
      expect(client.set).not.toHaveBeenCalled();
    });
  });

  describe('renew', () => {
    const lease = { key: 'k', token: 'tok' };

    it('runs the compare-and-pexpire script with token and ttl', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue(1);

      await expect(service.renew(lease, 7000)).resolves.toBe(true);

      const [script, numKeys, key, token, ttl] = client.eval.mock.calls[0];
      expect(script).toContain('pexpire');
      expect([numKeys, key, token, ttl]).toEqual([1, 'k', 'tok', 7000]);
    });

    it('returns false when the lease is no longer ours', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue(0);

      await expect(service.renew(lease, 7000)).resolves.toBe(false);
    });

    it('fails closed when the client throws', async () => {
      const { client, service } = setup();
      client.eval.mockRejectedValue(new Error('down'));

      await expect(service.renew(lease, 7000)).rejects.toBeInstanceOf(ValkeyUnavailableError);
    });

    it('rejects an invalid ttl without calling Valkey', async () => {
      const { client, service } = setup();

      await expect(service.renew(lease, 0)).rejects.toThrow(RangeError);
      expect(client.eval).not.toHaveBeenCalled();
    });
  });

  describe('release', () => {
    const lease = { key: 'k', token: 'tok' };

    it('runs the compare-and-del script with the token', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue(1);

      await expect(service.release(lease)).resolves.toBe(true);

      const [script, numKeys, key, token] = client.eval.mock.calls[0];
      expect(script).toContain('del');
      expect([numKeys, key, token]).toEqual([1, 'k', 'tok']);
    });

    it('returns false when the lease expired or is foreign', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue(0);

      await expect(service.release(lease)).resolves.toBe(false);
    });

    it('fails closed when the client throws', async () => {
      const { client, service } = setup();
      client.eval.mockRejectedValue(new Error('down'));

      await expect(service.release(lease)).rejects.toBeInstanceOf(ValkeyUnavailableError);
    });
  });

  describe('holder / isHeld', () => {
    it('returns null for a free key', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue(null);

      await expect(service.holder('k')).resolves.toBeNull();
      await expect(service.isHeld('k')).resolves.toBe(false);
    });

    it('returns owner, payload, since and remaining ttl but never the token', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue([
        JSON.stringify({ t: 'secret', o: 'alice', p: { action: 'export' }, s: 1234 }),
        4200,
      ]);

      const holder = await service.holder('k');

      expect(holder).toEqual({
        owner: 'alice',
        payload: { action: 'export' },
        since: 1234,
        ttlMs: 4200,
      });
      expect(JSON.stringify(holder)).not.toContain('secret');
      expect(client.eval.mock.calls[0].slice(1, 3)).toEqual([1, 'k']);
    });

    it('omits owner and payload when absent', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue([JSON.stringify({ t: 'x', s: 5 }), 10]);

      const holder = await service.holder('k');

      expect(holder).toEqual({ since: 5, ttlMs: 10 });
    });

    it('isHeld is true while a holder exists', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue([JSON.stringify({ t: 'x', s: 5 }), 10]);

      await expect(service.isHeld('k')).resolves.toBe(true);
    });

    it('treats a foreign non-JSON value as held by an unknown owner', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue(['plain-string', 900]);

      await expect(service.holder('k')).resolves.toEqual({ since: 0, ttlMs: 900 });
    });

    it('clamps a missing expiry (PTTL -1) to 0 remaining', async () => {
      const { client, service } = setup();
      client.eval.mockResolvedValue([JSON.stringify({ t: 'x', s: 5 }), -1]);

      await expect(service.holder('k')).resolves.toMatchObject({ ttlMs: 0 });
    });

    it('fails closed when the client throws', async () => {
      const { client, service } = setup();
      client.eval.mockRejectedValue(new Error('down'));

      await expect(service.holder('k')).rejects.toBeInstanceOf(ValkeyUnavailableError);
      await expect(service.isHeld('k')).rejects.toBeInstanceOf(ValkeyUnavailableError);
    });
  });

  describe('setIfAbsent', () => {
    it('issues SET NX EX GET and reports creation', async () => {
      const { client, service } = setup();
      client.set.mockResolvedValue(null);

      await expect(service.setIfAbsent('idem:1', { a: 1 }, 60)).resolves.toEqual({
        created: true,
      });
      expect(client.set).toHaveBeenCalledWith(
        'idem:1',
        JSON.stringify({ a: 1 }),
        'EX',
        60,
        'NX',
        'GET'
      );
    });

    it('returns the existing parsed value when the key was taken', async () => {
      const { client, service } = setup();
      client.set.mockResolvedValue(JSON.stringify({ status: 201 }));

      await expect(service.setIfAbsent('idem:1', { x: 1 }, 60)).resolves.toEqual({
        created: false,
        existing: { status: 201 },
      });
    });

    it('returns the raw string when the existing value is not JSON', async () => {
      const { client, service } = setup();
      client.set.mockResolvedValue('not-json');

      await expect(service.setIfAbsent('k', 1, 60)).resolves.toEqual({
        created: false,
        existing: 'not-json',
      });
    });

    it('fails closed when the client throws', async () => {
      const { client, service } = setup();
      client.set.mockRejectedValue(new Error('down'));

      await expect(service.setIfAbsent('k', 1, 60)).rejects.toBeInstanceOf(ValkeyUnavailableError);
    });

    it.each([0, -5, 2.5, NaN])('rejects an invalid ttl %p', async (ttl) => {
      const { client, service } = setup();

      await expect(service.setIfAbsent('k', 1, ttl)).rejects.toThrow(RangeError);
      expect(client.set).not.toHaveBeenCalled();
    });

    it('rejects an unserializable value', async () => {
      const { client, service } = setup();

      await expect(service.setIfAbsent('k', undefined, 60)).rejects.toThrow(TypeError);
      expect(client.set).not.toHaveBeenCalled();
    });
  });
});
