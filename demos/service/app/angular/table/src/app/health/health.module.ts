import {
  Logger,
  Module,
} from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [ TerminusModule ],
  providers: [ Logger ],
  controllers: [ HealthController ],
})
export class HealthModule {}
