import { ValkeyLockService } from './valkey-lock.service';
import { ValkeyService } from './valkey.service';
import { ValkeyUnavailableError } from './valkey-unavailable.error';

/**
 * Runs against a real Valkey/Redis, only when TEST_VALKEY_URL is set, e.g.
 *   TEST_VALKEY_URL=redis://localhost:6379 nx test nest-valkey
 */
const url = process.env['TEST_VALKEY_URL'];
const describeIf = url ? describe : describe.skip;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describeIf('ValkeyLockService (integration, real Valkey)', () => {
  let valkey: ValkeyService;
  let locks: ValkeyLockService;
  let prefix: string;
  const key = (n: string) => `${prefix}:${n}`;

  beforeAll(() => {
    valkey = new ValkeyService({ url });
    locks = new ValkeyLockService(valkey);
  });

  beforeEach(() => {
    prefix = `test:lock:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  });

  afterAll(() => {
    valkey.onApplicationShutdown();
  });

  it('is exclusive: a second acquire fails while the first lease is held', async () => {
    const a = await locks.acquire(key('x'), 5000, 'a');
    const b = await locks.acquire(key('x'), 5000, 'b');

    expect(a).not.toBeNull();
    expect(b).toBeNull();
    await locks.release(a!);
  });

  it('lets only one of many concurrent acquirers win', async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) => locks.acquire(key('race'), 5000, `w${i}`))
    );

    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('expires after the TTL and can then be acquired again', async () => {
    const a = await locks.acquire(key('ttl'), 150);
    expect(a).not.toBeNull();

    await sleep(300);

    await expect(locks.isHeld(key('ttl'))).resolves.toBe(false);
    const b = await locks.acquire(key('ttl'), 1000);
    expect(b).not.toBeNull();
    await locks.release(b!);
  });

  it('renews only with the own token and extends the TTL', async () => {
    const a = (await locks.acquire(key('renew'), 300))!;

    await expect(locks.renew({ ...a, token: 'forged' }, 60000)).resolves.toBe(false);
    expect((await locks.holder(key('renew')))!.ttlMs).toBeLessThanOrEqual(300);

    await expect(locks.renew(a, 60000)).resolves.toBe(true);
    expect((await locks.holder(key('renew')))!.ttlMs).toBeGreaterThan(1000);
    await locks.release(a);
  });

  it('cannot renew an expired lease', async () => {
    const a = (await locks.acquire(key('renew-exp'), 100))!;
    await sleep(250);

    await expect(locks.renew(a, 5000)).resolves.toBe(false);
    await expect(locks.isHeld(key('renew-exp'))).resolves.toBe(false);
  });

  it('release with a foreign token changes nothing', async () => {
    const a = (await locks.acquire(key('rel'), 5000, 'a'))!;

    await expect(locks.release({ key: a.key, token: 'forged' })).resolves.toBe(false);
    await expect(locks.isHeld(key('rel'))).resolves.toBe(true);

    await expect(locks.release(a)).resolves.toBe(true);
    await expect(locks.isHeld(key('rel'))).resolves.toBe(false);
  });

  it('a stale lease cannot release the lock of its successor', async () => {
    const old = (await locks.acquire(key('stale'), 100))!;
    await sleep(250);
    const fresh = (await locks.acquire(key('stale'), 5000))!;

    await expect(locks.release(old)).resolves.toBe(false);
    await expect(locks.isHeld(key('stale'))).resolves.toBe(true);
    await locks.release(fresh);
  });

  it('release is not repeatable', async () => {
    const a = (await locks.acquire(key('twice'), 5000))!;

    await expect(locks.release(a)).resolves.toBe(true);
    await expect(locks.release(a)).resolves.toBe(false);
  });

  it('holder reports owner, payload, since and remaining ttl, never the token', async () => {
    const before = Date.now();
    const a = (await locks.acquire(key('holder'), 5000, 'alice', { action: 'export' }))!;

    const holder = await locks.holder(key('holder'));

    expect(holder).toMatchObject({ owner: 'alice', payload: { action: 'export' } });
    expect(holder!.since).toBeGreaterThanOrEqual(before - 5);
    expect(holder!.ttlMs).toBeGreaterThan(0);
    expect(holder!.ttlMs).toBeLessThanOrEqual(5000);
    expect(JSON.stringify(holder)).not.toContain(a.token);
    await locks.release(a);
  });

  it('holder is null for a free key', async () => {
    await expect(locks.holder(key('free'))).resolves.toBeNull();
  });

  it('setIfAbsent creates once and then returns the existing value', async () => {
    await expect(locks.setIfAbsent(key('idem'), { status: 201 }, 30)).resolves.toEqual({
      created: true,
    });
    await expect(locks.setIfAbsent(key('idem'), { status: 500 }, 30)).resolves.toEqual({
      created: false,
      existing: { status: 201 },
    });
  });

  it('setIfAbsent value expires after its ttl', async () => {
    await locks.setIfAbsent(key('idem-ttl'), 1, 1);
    await sleep(1300);

    await expect(locks.setIfAbsent(key('idem-ttl'), 2, 30)).resolves.toEqual({ created: true });
  });

  it('exposes the raw client', async () => {
    await expect(valkey.client.ping()).resolves.toBe('PONG');
  });

  it('fails closed (ValkeyUnavailableError) when Valkey is unreachable', async () => {
    const dead = new ValkeyService({ host: '127.0.0.1', port: 1 });
    const deadLocks = new ValkeyLockService(dead);

    await expect(deadLocks.acquire('k', 1000)).rejects.toBeInstanceOf(ValkeyUnavailableError);
    await expect(deadLocks.isHeld('k')).rejects.toBeInstanceOf(ValkeyUnavailableError);
    dead.onApplicationShutdown();
  });
});

