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
export class CacheModuleOptionsLoader implements CacheOptionsFactory {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  createCacheOptions(): CacheModuleOptions {
    const ttl = Number(this.config.get('CACHE_TTL', 60 * 60 * 24));
    const max = Number(this.config.get('CACHE_MAX', 100));
    return {
      isGlobal: true,
      ttl: isNaN(ttl) ? 60 * 60 * 24 : ttl,
      max: isNaN(max) ? 100 : max,
    };
  }

}
