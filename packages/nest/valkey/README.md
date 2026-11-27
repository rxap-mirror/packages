[![npm version](https://img.shields.io/npm/v/@rxap/nest-valkey?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-valkey)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![npm](https://img.shields.io/npm/dm/@rxap/nest-valkey)
![NPM](https://img.shields.io/npm/l/@rxap/nest-valkey)

NestJS module for [Valkey](https://valkey.io) (and Redis-compatible servers): a JSON cache
service, a **distributed lock API**, idempotency keys and a Terminus health indicator.

- [Installation](#installation)
- [Configuration](#configuration)
- [Services](#services)
- [Fail-soft vs. fail-closed](#fail-soft-vs-fail-closed)
- [Tests](#tests)

# Installation

```bash
npm install @rxap/nest-valkey
npm install @nestjs/common @nestjs/config @nestjs/terminus @rxap/nest-utilities ioredis joi
```
With pnpm or yarn use `pnpm add` or `yarn add` instead of `npm install`.

# Configuration

| Variable          | Default     | Description                                                                 |
|-------------------|-------------|-----------------------------------------------------------------------------|
| `VALKEY_URL`      | _(empty)_   | `redis://` / `rediss://` URL. **Takes precedence** over host/port. `rediss://` implies TLS. |
| `VALKEY_HOST`     | `localhost` | Host (ignored when `VALKEY_URL` is set)                                     |
| `VALKEY_PORT`     | `6379`      | Port (ignored when `VALKEY_URL` is set)                                     |
| `VALKEY_PASSWORD` | _(empty)_   | Password; overrides one embedded in the URL                                 |
| `VALKEY_TLS`      | `false`     | `true`/`1` enables TLS for host/port connections                            |

Empty strings are valid for every variable (docker compose passes unset variables through as `""`).
The password is never logged: connection errors and cache failures are redacted (URL credentials
and the configured password are masked).

```typescript
ConfigModule.forRoot({
  validationSchema: Joi.object({ ...valkeyValidationSchema(environment) }),
});

@Module({
  imports: [
    ValkeyModule.registerAsync({
      imports: [ConfigModule],
      useClass: ValkeyModuleOptionsFactory,
    }),
  ],
})
export class AppModule {}
```

`ValkeyModule` is global; `ValkeyService`, `ValkeyLockService` and `ValkeyHealthIndicator` can be injected anywhere.
For options without the environment use `ValkeyModule.register({ url, tls: { ca } })`; `tls` may also be a
`tls.ConnectionOptions` object.

# Services

## ValkeyService

JSON cache: `get`, `mget`, `set(key, value, ttlSeconds?)`, `del`, `delStrict`, `incr`, `ping`.
The raw [ioredis](https://github.com/redis/ioredis) client is available as `valkey.client` (readonly) for special cases.

## ValkeyLockService

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

# Fail-soft vs. fail-closed

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

# Tests

Unit tests use a mocked client. An integration suite against a real Valkey runs only when
`TEST_VALKEY_URL` is set:

```bash
docker run -d --rm -p 127.0.0.1:16379:6379 valkey/valkey:8
TEST_VALKEY_URL=redis://127.0.0.1:16379 pnpm nx test nest-valkey
```
