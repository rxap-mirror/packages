import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import { redactSecrets } from './redact';
import { VALKEY_MODULE_OPTIONS } from './tokens';
import { ValkeyModuleOptions } from './valkey-module-options';

/**
 * Generic Valkey (Redis-fork) client + a thin cache wrapper. `get`/`set`/`del`
 * fail closed: an unreachable/errored Valkey degrades callers to a cache miss
 * (or a no-op write/delete) instead of throwing — callers that build specific
 * caches on top (e.g. a Typesense parent-key cache) inherit this for free
 * rather than having to reimplement it per use case. {@link delStrict},
 * {@link incr} and {@link mget} are the deliberate exceptions — see their own
 * doc comments.
 */
@Injectable()
export class ValkeyService implements OnApplicationShutdown {
  private readonly logger = new Logger(ValkeyService.name);
  /** The raw ioredis client, for special cases the wrappers do not cover. */
  readonly client: Redis;
  private readonly password?: string;

  constructor(@Inject(VALKEY_MODULE_OPTIONS) options: ValkeyModuleOptions) {
    this.password = options.password || undefined;

    const common: RedisOptions = {
      // Never throw/queue forever on a down cache — callers must fail closed
      // rather than pile up pending commands against an unreachable instance.
      lazyConnect: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 500, 5000),
    };
    if (this.password) {
      common.password = this.password;
    }
    if (options.tls) {
      common.tls = options.tls === true ? {} : options.tls;
    }

    // A URL wins over host/port; `rediss://` enables TLS on its own.
    this.client = options.url
      ? new Redis(options.url, common)
      : new Redis({
          host: options.host ?? 'localhost',
          port: options.port ?? 6379,
          ...common,
        });

    this.client.on('error', (err) => {
      this.logger.warn(`Valkey connection error: ${this.redact(err?.message)}`);
    });
  }

  /** Masks the password and URL credentials; never log raw error messages. */
  private redact(message: string | undefined): string {
    return redactSecrets(message ?? '', [this.password]);
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const raw = await this.client.get(key);
      return raw === null ? undefined : (JSON.parse(raw) as T);
    } catch (e: any) {
      this.logger.warn(`cache get(${key}) failed: ${this.redact(e?.message)}`);
      return undefined;
    }
  }

  /**
   * {@link get} for several keys in one round trip (`MGET`), in key order. Unlike {@link get} it
   * does NOT fail closed: its caller (the feature-resolution cache reader) degrades an error to a
   * miss itself and counts it as `error`, which it could not tell from a plain miss otherwise.
   */
  async mget<T>(keys: string[]): Promise<Array<T | undefined>> {
    if (keys.length === 0) {
      return [];
    }
    const raws = await this.client.mget(...keys);
    return raws.map((raw) => (raw === null ? undefined : (JSON.parse(raw) as T)));
  }

  /**
   * Atomic `INCR`: a missing key counts as 0, the new value is returned. Like {@link delStrict}
   * it does NOT fail closed — it is an invalidation primitive (a generation counter), and a caller
   * that relies on it must be able to tell that it did not happen. The value is a plain integer,
   * which {@link get}/{@link mget} read back as a number.
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const raw = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, raw, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, raw);
      }
    } catch (e: any) {
      this.logger.warn(`cache set(${key}) failed: ${this.redact(e?.message)}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (e: any) {
      this.logger.warn(`cache del(${key}) failed: ${this.redact(e?.message)}`);
    }
  }

  /**
   * Like {@link del}, but does NOT fail closed — a Valkey error propagates
   * instead of being swallowed. Fail-closed is right for `del` used as a
   * best-effort cache-eviction hint (a miss is harmless), but wrong when the
   * caller's own correctness depends on the delete actually happening — e.g.
   * an invalidation endpoint whose caller retries on failure. Silently
   * "succeeding" there would let a stale entry survive its full TTL while
   * every log line says the invalidation worked.
   */
  async delStrict(key: string): Promise<void> {
    await this.client.del(key);
  }

  /** Raw PING, used by ValkeyHealthIndicator. Not fail-closed — callers decide. */
  ping(): Promise<string> {
    return this.client.ping();
  }

  onApplicationShutdown(): void {
    this.client.disconnect();
  }
}
