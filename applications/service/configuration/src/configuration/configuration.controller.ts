import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
} from '@nestjs/common';
import { Public } from '@rxap/nest-utilities';
import { valid } from 'semver';
import { ConfigurationService } from './configuration.service';

@Controller()
@Public()
export class ConfigurationController {

  @Inject(ConfigurationService)
  private readonly configurationService!: ConfigurationService;

  @Get('latest/:application')
  getLatest(@Param('application') application: string) {
    return this.configurationService.getLatest(application);
  }

  @Get(':version/:application')
  getVersion(@Param('version') version: string, @Param('application') application: string) {
    if (!valid(version)) {
      throw new BadRequestException(`Invalid version: ${ version }`);
    }
    return this.configurationService.getVersion(version, application);
  }

}
