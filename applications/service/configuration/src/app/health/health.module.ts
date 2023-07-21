import {
  Logger,
  Module,
} from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ConfigurationHealthIndicator } from './configuration-health-indicator.service';

@Module({
  imports: [ TerminusModule ],
  providers: [
    Logger,
    ConfigurationHealthIndicator,
  ],
  controllers: [ HealthController ],
})
export class HealthModule {
}
