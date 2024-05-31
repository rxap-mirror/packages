import {
  Global,
  Logger,
  Module,
} from '@nestjs/common';
import { SentryLogger } from '@rxap/nest-sentry';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useClass: SentryLogger,
    },
  ],
  exports: [ Logger ],
})
export class SentryLoggerModule {}
