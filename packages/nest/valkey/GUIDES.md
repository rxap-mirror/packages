# Guides

## Services

### ValkeyService

JSON cache: `get`, `mget`, `set(key, value, ttlSeconds?)`, `del`, `delStrict`, `incr`, `ping`.
The raw [ioredis](https://github.com/redis/ioredis) client is available as `valkey.client` (readonly) for special cases.

### ValkeyLockService

| Method                                     | Description                                                                                 |
|--------------------------------------------|---------------------------------------------------------------------------------------------|
| `acquire(key, ttlMs, owner?, payload?)`    | `SET key value NX PX ttl` → `ValkeyLease` or `null` when held. The token is random per call. |
| `renew(lease, ttlMs)`                      | Resets the TTL, only with the own token (Lua compare-and-pexpire). `false` if lost.          |
| `release(lease)`                           | Deletes the lock, only with the own token (Lua compare-and-del). `false` if lost.            |
| `holder(key)` / `isHeld(key)`              | `{ owner?, payload?, since, ttlMs }` or `null` – for a "busy" display. Never exposes the token. |
| `setIfAbsent(key, value, ttlSeconds)`      | `SET NX EX GET` for idempotency keys → `{ created: true }` or `{ created: false, existing }`. |

```typescript
const lease = await this.locks.acquire(`lock:project:${id}`, 30_000, userId, { action: 'export' });
if (!lease) {
  const busy = await this.locks.holder(`lock:project:${id}`);
  throw new ConflictException({ busy });
}
try {
  await doWork(() => this.locks.renew(lease, 30_000)); // heartbeat for long jobs
} finally {
  await this.locks.release(lease);
}
```

Idempotency key:

```typescript
const r = await this.locks.setIfAbsent(`idem:${key}`, { status: 'pending' }, 24 * 3600);
if (!r.created) return r.existing; // replay of an earlier request
```

> **Guarantees and limits.** The lock lives on a single Valkey server (`SET NX PX`, no Redlock across
> several servers). If that server crashes without persistence, or fails over to a replica that had not
> received the last write, held locks can be lost and two clients may briefly hold the "same" lock.
> That is fine for coordination and "busy" displays. If a double access would corrupt data, additionally
> guard the target itself (version check, unique constraint) – that is the responsibility of the caller.
>
> A lock is also only safe while the holder finishes within the TTL: renew it for long jobs and treat a
> failed `renew` as "lock lost" (stop working).

## Fail-soft vs. fail-closed

* **Cache methods** (`get`, `set`, `del`) are *fail-soft*: an unreachable Valkey degrades to a miss / no-op.
  `mget`, `incr`, `delStrict`, `ping` propagate errors.
* **Lock API and `setIfAbsent`** are *fail-closed*: any client error (connection refused, timeout,
  command failure) is thrown as `ValkeyUnavailableError` (`code === 'VALKEY_UNAVAILABLE'`) — never
  a silent `false`/`null`. Map it to HTTP 503:

```typescript
try {
  await this.locks.acquire(key, 5000);
} catch (e) {
  if (e instanceof ValkeyUnavailableError) throw new ServiceUnavailableException();
  throw e;
}
```

Invalid arguments (non-positive/non-integer TTL, empty key, non-serializable value) throw
`RangeError` / `TypeError` before any command is sent.

## Health check

Add `ValkeyHealthIndicator.isHealthy()` to a Terminus `HealthCheckService.check([...])` (PING with a 5 s timeout).

## Tests

Unit tests use a mocked client. An integration suite against a real Valkey runs only when
`TEST_VALKEY_URL` is set:

```bash
docker run -d --rm -p 127.0.0.1:16379:6379 valkey/valkey:8
TEST_VALKEY_URL=redis://127.0.0.1:16379 pnpm nx test nest-valkey
```
