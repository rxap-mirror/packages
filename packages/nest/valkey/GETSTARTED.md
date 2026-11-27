# Get started

NestJS module for [Valkey](https://valkey.io) (and Redis-compatible servers): a JSON cache service,
a **distributed lock API**, idempotency keys and a Terminus health indicator.

Install the peers: `npm install @nestjs/common @nestjs/config @nestjs/terminus @rxap/nest-utilities ioredis joi`

## Configuration

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

## Quick example

```typescript
@Injectable()
export class ExportService {
  constructor(private readonly locks: ValkeyLockService) {}

  async run(id: string) {
    const lease = await this.locks.acquire(`lock:export:${id}`, 30_000, 'worker-1', { action: 'export' });
    if (!lease) return { busy: await this.locks.holder(`lock:export:${id}`) };
    try {
      /* ... */
    } finally {
      await this.locks.release(lease);
    }
  }
}
```

A Valkey outage raises `ValkeyUnavailableError` from the lock API (fail-closed) – answer with HTTP 503.
