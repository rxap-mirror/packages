import {
  Global,
  Logger,
  Module,
} from '@nestjs/common';
import { RxapLogger } from './logger';

@Global()
@Module({
  providers: [
    RxapLogger,
    {
      provide: Logger,
      useExisting: RxapLogger,
    },
  ],
  exports: [ Logger ],
})
export class LoggerModule {}
