import {
  Logger,
  Module,
} from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { StatusController } from './status.controller';
import { HttpModule } from '@nestjs/axios';
import { ServiceRegistryService } from './service-registry.service';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
  providers: [
    Logger,
    ServiceRegistryService,
  ],
  controllers: [
    StatusController,
  ],
})
export class StatusModule {}
