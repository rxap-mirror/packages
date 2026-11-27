# Guides

- **Health check:** add `ValkeyHealthIndicator.isHealthy()` to a Terminus `HealthCheckService.check([...])` (PING with a 5 s timeout).
- **Busy indicator:** `holder(key)` returns `owner`, `payload` (e.g. `{ action }`), `since` (ms epoch) and the remaining `ttlMs`.
- **Long jobs:** call `renew(lease, ttlMs)` at roughly a third of the TTL; a `false` result means the lock was lost and the job must stop.
- **Idempotency:** `setIfAbsent(key, value, ttlSeconds)` is atomic (`SET NX EX GET`); store the final response under the same key via `ValkeyService.set` once done.
- **Raw access:** `ValkeyService.client` is the underlying ioredis instance.
