import {
  Global,
  Logger,
  Module,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RxapLogger } from '@rxap/nest-logger';
import { SentryLogger } from './sentry.logger';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useFactory: (config: ConfigService, sentry: SentryLogger, rxap: RxapLogger) => {
        if (config.get('SENTRY_ENABLED')) {
          return sentry;
        } else {
          return rxap;
        }
      },
      inject: [ ConfigService, SentryLogger, RxapLogger ]
    },
    SentryLogger,
    RxapLogger,
  ],
  exports: [ Logger ],
})
export class SentryLoggerModule {}
