import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RxapLogger } from '@rxap/nest-logger';
import { SentryLogger } from '@rxap/nest-sentry';

export function UseSentryLoggerFactory() {
  return (app: INestApplicationContext, config: ConfigService) => {
    if (config.get('SENTRY_ENABLED')) {
      return app.get(SentryLogger);
    } else {
      return app.get(RxapLogger);
    }
  };
}
