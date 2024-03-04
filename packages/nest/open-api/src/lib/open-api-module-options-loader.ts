import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RXAP_GLOBAL_STATE } from '@rxap/nest-utilities';
import {
  ExistsFileWithScope,
  InjectScopeInFilePath,
  ReadFileWithScope,
} from '@rxap/node-utilities';
import { OpenApiModuleOptions } from './open-api.module';

@Injectable()
export class OpenApiModuleOptionsLoader implements ConfigurableModuleOptionsFactory<OpenApiModuleOptions, 'create'> {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  @Inject(Logger)
  private readonly logger!: Logger;

  create(): OpenApiModuleOptions {
    const openApiServerConfigFilePath = this.config.getOrThrow('OPEN_API_SERVER_CONFIG_FILE_PATH');
    const config: OpenApiModuleOptions = {};
    if (!this.existsFileWithScope(openApiServerConfigFilePath)) {
      this.logger.warn(
        `The open api server config file path "${ openApiServerConfigFilePath }" does not exists!`,
        'OpenApiModuleOptionsLoader',
      );
    } else {
      let content = this.readFileWithScope(openApiServerConfigFilePath);
      try {
        content = this.interpolateEnvVariables(content);
      } catch (e: any) {
        throw new Error(`Could not interpolate env variables in open api server config file "${ this.fileNameWithScope(openApiServerConfigFilePath) }": ${ e.message }`);
      }
      try {
        config.serverConfig = JSON.parse(content);
      } catch (e: any) {
        throw new Error(`Could not parse open api server config file "${ this.fileNameWithScope(openApiServerConfigFilePath) }": ${ e.message }`);
      }
    }
    return config;
  }

  private existsFileWithScope(filePath: string): boolean {
    return ExistsFileWithScope(filePath, RXAP_GLOBAL_STATE.environment?.name);
  }

  private readFileWithScope(filePath: string): string {
    return ReadFileWithScope(filePath, RXAP_GLOBAL_STATE.environment?.name);
  }

  private fileNameWithScope(filePath: string): string {
    return InjectScopeInFilePath(filePath, RXAP_GLOBAL_STATE.environment?.name);
  }

  private interpolateEnvVariables(value: string): string {
    return value.replace(/\${(.+?)}/g, (_, key) => this.config.getOrThrow(key));
  }

}
