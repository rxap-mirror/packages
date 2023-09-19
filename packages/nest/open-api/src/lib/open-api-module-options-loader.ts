import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  existsSync,
  readFileSync,
} from 'fs';
import { OpenApiModuleOptions } from './open-api.module';

@Injectable()
export class OpenApiModuleOptionsLoader {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  @Inject(Logger)
  private readonly logger!: Logger;

  create(): OpenApiModuleOptions {
    const openApiServerConfigFilePath = this.config.getOrThrow('OPEN_API_SERVER_CONFIG_FILE_PATH');
    const config: OpenApiModuleOptions = {};
    if (!existsSync(openApiServerConfigFilePath)) {
      this.logger.warn(
        `The open api server config file path "${ openApiServerConfigFilePath }" does not exists!`,
        'OpenApiModuleOptionsLoader',
      );
    } else {
      const content = readFileSync(openApiServerConfigFilePath, 'utf-8');
      try {
        config.serverConfig = JSON.parse(content);
      } catch (e: any) {
        throw new Error(`Could not parse open api server config file "${ openApiServerConfigFilePath }"`);
      }
    }
    return config;
  }

}
