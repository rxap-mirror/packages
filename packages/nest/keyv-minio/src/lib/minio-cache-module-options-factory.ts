import {
  CacheOptions,
  CacheStore,
  CacheStoreSetOptions,
} from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import {
  KeyvMinio,
  KeyvMinioOptions,
} from './keyv-minio';
import { CacheModuleOptionsLoader } from '@rxap/nest-utilities';
import {
  KeyvStoreAdapter,
  StoredData,
  StoredDataRaw,
} from 'keyv';


function isStoredDataRaw<Value>(value: StoredData<Value>): value is StoredDataRaw<Value> {
  return value !== undefined && value !== null && typeof value === 'object' && 'value' in value && 'expires' in value;
}

/**
 * Adapter to convert the v6 keyv store to the v5 keyv store
 * Required util nestjs support cache-manager v6
 * https://github.com/nestjs/cache-manager/pull/508
 */
class CacheStoreV6ToV5Adapter implements CacheStore {

  constructor(private readonly store: KeyvStoreAdapter) {}

  async set<T>(key: string, value: T, options?: CacheStoreSetOptions<T> | number): Promise<void> {
    let ttl: number | undefined = undefined;
    if (typeof options === 'number') {
      ttl = options;
    } else if (typeof options?.ttl === 'number') {
      ttl = options.ttl;
    } else if (typeof options?.ttl === 'function') {
      ttl = options.ttl(value);
    }
    await this.store.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const cache = await this.store.get(key);
    if (cache && isStoredDataRaw<T>(cache)) {
      if (cache.expires && cache.expires < Date.now()) {
        await this.store.delete(key);
        return undefined;
      }
      return cache.value;
    }
    return cache as T;
  }

  async del(key: string): Promise<void> {
    await this.store.delete(key);
  }

}

@Injectable()
export class MinioCacheModuleOptionsFactory extends CacheModuleOptionsLoader<KeyvMinioOptions> {

  override createCacheOptions(): CacheOptions<KeyvMinioOptions> {
    return {
      ...super.createCacheOptions(),
      endPoint: this.config.getOrThrow('MINIO_END_POINT'),
      port: this.config.get('MINIO_PORT', 9000),
      useSSL: this.config.get('MINIO_USE_SSL', false),
      accessKey: this.config.getOrThrow('MINIO_ACCESS_KEY'),
      secretKey: this.config.getOrThrow('MINIO_SECRET_KEY'),
      bucketName: this.config.get('MINIO_BUCKET_NAME', 'keyv'),
      store: (options) => new CacheStoreV6ToV5Adapter(new KeyvMinio(options as KeyvMinioOptions)),
    };
  }

}
