import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ValkeyUnavailableError } from './valkey-unavailable.error';
import { ValkeyService } from './valkey.service';

/** Proof of lock ownership returned by {@link ValkeyLockService.acquire}. */
export interface ValkeyLease {
  readonly key: string;
  readonly token: string;
  readonly owner?: string;
}

/** What {@link ValkeyLockService.holder} reveals about a held lock (never the token). */
export interface ValkeyLockHolder<P = Record<string, unknown>> {
  owner?: string;
  payload?: P;
  /** Acquisition time, ms since epoch (0 when the value was not written by this service). */
  since: number;
  /** Remaining lifetime in ms. */
  ttlMs: number;
}

export type ValkeySetIfAbsentResult<T = unknown> =
  | { created: true }
  | { created: false; existing: T | undefined };

/** Extends the TTL only while the stored token is ours. */
const RENEW_SCRIPT = `
local ok, v = pcall(cjson.decode, redis.call('get', KEYS[1]) or '')
if ok and type(v) == 'table' and v.t == ARGV[1] then
  return redis.call('pexpire', KEYS[1], ARGV[2])
end
return 0`;

/** Deletes the key only while the stored token is ours. */
const RELEASE_SCRIPT = `
local ok, v = pcall(cjson.decode, redis.call('get', KEYS[1]) or '')
if ok and type(v) == 'table' and v.t == ARGV[1] then
  return redis.call('del', KEYS[1])
end
return 0`;

/** Reads value and remaining TTL in one atomic step. */
const HOLDER_SCRIPT = `
local raw = redis.call('get', KEYS[1])
if not raw then return nil end
return { raw, redis.call('pttl', KEYS[1]) }`;

/**
 * Distributed lock (single-instance `SET NX PX` + token-guarded Lua scripts) and
 * idempotency-key primitive.
 *
 * Unlike the cache methods of {@link ValkeyService} everything here fails closed:
 * an unreachable Valkey raises {@link ValkeyUnavailableError} instead of
 * pretending the lock is free or the key absent.
 */
@Injectable()
export class ValkeyLockService {
  constructor(@Inject(ValkeyService) private readonly valkey: ValkeyService) {}

  /** `SET key value NX PX ttl`; resolves a lease, or `null` when the key is held. */
  async acquire(
    key: string,
    ttlMs: number,
    owner?: string,
    payload?: Record<string, unknown>
  ): Promise<ValkeyLease | null> {
    assertKey(key);
    assertPositiveInteger(ttlMs, 'ttlMs');
    const token = randomBytes(16).toString('hex');
    const value = JSON.stringify({ t: token, o: owner, p: payload, s: Date.now() });

    const reply = await this.run(`acquire(${key})`, () =>
      this.valkey.client.set(key, value, 'PX', ttlMs, 'NX')
    );

    if (reply !== 'OK') {
      return null;
    }
    return owner === undefined ? { key, token } : { key, token, owner };
  }

  /** Resets the TTL; `false` when the lease expired or belongs to somebody else. */
  async renew(lease: ValkeyLease, ttlMs: number): Promise<boolean> {
    assertPositiveInteger(ttlMs, 'ttlMs');
    const result = await this.run(`renew(${lease.key})`, () =>
      this.valkey.client.eval(RENEW_SCRIPT, 1, lease.key, lease.token, ttlMs)
    );
    return Number(result) === 1;
  }

  /** Deletes the lock; `false` when the lease expired or belongs to somebody else. */
  async release(lease: ValkeyLease): Promise<boolean> {
    const result = await this.run(`release(${lease.key})`, () =>
      this.valkey.client.eval(RELEASE_SCRIPT, 1, lease.key, lease.token)
    );
    return Number(result) === 1;
  }

  /** Current holder (for a "busy" display) or `null` when the key is free. */
  async holder<P = Record<string, unknown>>(
    key: string
  ): Promise<ValkeyLockHolder<P> | null> {
    assertKey(key);
    const reply = (await this.run(`holder(${key})`, () =>
      this.valkey.client.eval(HOLDER_SCRIPT, 1, key)
    )) as [string, number] | null;

    if (!reply) {
      return null;
    }
    const [raw, pttl] = reply;
    const holder: ValkeyLockHolder<P> = { since: 0, ttlMs: Math.max(0, Number(pttl)) };
    const stored = parseStored(raw);
    if (stored) {
      holder.since = typeof stored.s === 'number' ? stored.s : 0;
      if (stored.o !== undefined) holder.owner = stored.o;
      if (stored.p !== undefined) holder.payload = stored.p as P;
    }
    return holder;
  }

  async isHeld(key: string): Promise<boolean> {
    return (await this.holder(key)) !== null;
  }

  /**
   * Atomic `SET key value NX EX ttl GET` (idempotency keys). `created: false`
   * carries the value that is already stored.
   */
  async setIfAbsent<T = unknown>(
    key: string,
    value: unknown,
    ttlSeconds: number
  ): Promise<ValkeySetIfAbsentResult<T>> {
    assertKey(key);
    assertPositiveInteger(ttlSeconds, 'ttlSeconds');
    const raw = JSON.stringify(value);
    if (raw === undefined) {
      throw new TypeError('value must be JSON serializable');
    }

    const previous = await this.run(`setIfAbsent(${key})`, () =>
      this.valkey.client.set(key, raw, 'EX', ttlSeconds, 'NX', 'GET')
    );

    if (previous === null || previous === undefined) {
      return { created: true };
    }
    try {
      return { created: false, existing: JSON.parse(previous) as T };
    } catch {
      return { created: false, existing: previous as unknown as T };
    }
  }

  private async run<R>(operation: string, fn: () => Promise<R>): Promise<R> {
    try {
      return await fn();
    } catch (e) {
      throw new ValkeyUnavailableError(operation, e);
    }
  }
}

function assertKey(key: string): void {
  if (typeof key !== 'string' || key.length === 0) {
    throw new TypeError('key must be a non-empty string');
  }
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

function parseStored(
  raw: string
): { t?: string; o?: string; p?: unknown; s?: number } | undefined {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
}
