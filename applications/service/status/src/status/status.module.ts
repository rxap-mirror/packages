import { HttpModule } from '@nestjs/axios';
import {
  Logger,
  Module,
} from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ServiceRegistryService } from './service-registry.service';
import { ServiceHealthIndicator } from './service.health-indicator';
import { StatusController } from './status.controller';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
  providers: [
    Logger,
    ServiceRegistryService,
    ServiceHealthIndicator,
  ],
  controllers: [
    StatusController,
  ],
})
export class StatusModule {}
