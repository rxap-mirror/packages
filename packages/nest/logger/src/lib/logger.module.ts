import {
  Global,
  Logger,
  Module,
} from '@nestjs/common';
import { RxapLogger } from './logger';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useClass: RxapLogger,
    },
  ],
  exports: [ Logger ],
})
export class LoggerModule {}
