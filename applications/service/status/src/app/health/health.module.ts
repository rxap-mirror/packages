import {
  Logger,
  Module,
} from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { HEALTH_INDICATOR_LIST } from '@rxap/nest-open-api';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
  providers: [
    Logger,
    {
      provide: HEALTH_INDICATOR_LIST,
      useFactory: (...list) => list,
      inject: [],
    },
  ],
  controllers: [ HealthController ],
})
export class HealthModule {}
