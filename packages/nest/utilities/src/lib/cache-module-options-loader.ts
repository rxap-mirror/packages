import {
  CacheModuleOptions,
  CacheOptionsFactory,
} from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheModuleOptionsLoader<StoreConfig extends Record<any, any> = Record<string, any>> implements CacheOptionsFactory<StoreConfig> {

  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  createCacheOptions(): CacheModuleOptions<StoreConfig> | Promise<CacheModuleOptions<StoreConfig>> {
    const ttl = Number(this.config.get('CACHE_TTL', 60 * 60 * 1000));
    const max = Number(this.config.get('CACHE_MAX', 100));
    return {
      isGlobal: true,
      ttl: isNaN(ttl) ? 60 * 60 * 1000 : ttl,
      max: isNaN(max) ? 100 : max,
    } as CacheModuleOptions<StoreConfig>;
  }

}
