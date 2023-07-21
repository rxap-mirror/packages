import {
  Logger,
  Module,
} from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { LoadConfigurationService } from './load-configuration.service';

@Module({
  controllers: [ ConfigurationController ],
  providers: [
    Logger,
    ConfigurationService,
    LoadConfigurationService,
  ],
})
export class ConfigurationModule {}
