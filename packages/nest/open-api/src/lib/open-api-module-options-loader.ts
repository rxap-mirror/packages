import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RXAP_GLOBAL_STATE } from '@rxap/nest-utilities';
import {
  ExistsFileWithScope,
  ReadFileWithScope,
} from '@rxap/node-utilities';
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
    if (!ExistsFileWithScope(openApiServerConfigFilePath, RXAP_GLOBAL_STATE.environment?.name)) {
      this.logger.warn(
        `The open api server config file path "${ openApiServerConfigFilePath }" does not exists!`,
        'OpenApiModuleOptionsLoader',
      );
    } else {
      const content = ReadFileWithScope(openApiServerConfigFilePath, RXAP_GLOBAL_STATE.environment?.name);
      try {
        config.serverConfig = JSON.parse(content);
      } catch (e: any) {
        throw new Error(`Could not parse open api server config file "${ openApiServerConfigFilePath }"`);
      }
    }
    return config;
  }

}
