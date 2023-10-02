import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';

@Injectable()
export class ThrottlerModuleOptionsLoader implements ThrottlerOptionsFactory {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          ttl: this.config.getOrThrow('THROTTLER_TTL'),
          limit: this.config.getOrThrow('THROTTLER_LIMIT'),
        },
      ],
    };
  }

}
