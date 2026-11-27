# Get started

1. Install the package and its peers (see README).
2. Add the validation schema and the module:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ValkeyModule, ValkeyModuleOptionsFactory, valkeyValidationSchema } from '@rxap/nest-valkey';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({ ...valkeyValidationSchema('production' as any) }),
    }),
    ValkeyModule.registerAsync({ imports: [ConfigModule], useClass: ValkeyModuleOptionsFactory }),
  ],
})
export class AppModule {}
```

3. Configure via environment: `VALKEY_URL=rediss://:password@valkey.example:6380` (or `VALKEY_HOST`/`VALKEY_PORT`/`VALKEY_PASSWORD`/`VALKEY_TLS`).
4. Use the lock API:

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

A Valkey outage raises `ValkeyUnavailableError` from the lock API (fail-closed) – answer with 503.
