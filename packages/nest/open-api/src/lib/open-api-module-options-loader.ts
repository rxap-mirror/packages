import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ENVIRONMENT,
  Environment,
  RXAP_GLOBAL_STATE,
} from '@rxap/nest-utilities';
import {
  ExistsFileWithScope,
  InjectScopeInFilePath,
  ReadFileWithScope,
} from '@rxap/node-utilities';
import { coerceArray } from '@rxap/utilities';
import { existsSync } from 'fs';
import { OpenApiModuleOptions } from './open-api.module';

@Injectable()
export class OpenApiModuleOptionsLoader implements ConfigurableModuleOptionsFactory<OpenApiModuleOptions, 'create'> {

  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  @Inject(Logger)
  protected readonly logger!: Logger;

  @Optional()
  @Inject(ENVIRONMENT)
  protected readonly environment: Environment | null = RXAP_GLOBAL_STATE.environment;

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
        config.serverConfig = coerceArray(JSON.parse(content));
      } catch (e: any) {
        throw new Error(`Could not parse open api server config file "${ this.fileNameWithScope(openApiServerConfigFilePath) }": ${ e.message }`);
      }
    }
    return config;
  }

  protected existsFileWithScope(filePath: string): boolean {
    return ExistsFileWithScope(filePath, this.environment?.name, this.environment?.production);
  }

  protected readFileWithScope(filePath: string): string {
    return ReadFileWithScope(filePath, this.environment?.name, this.environment?.production, 'utf-8', this.logger);
  }

  protected fileNameWithScope(filePath: string): string {
    const filename = InjectScopeInFilePath(filePath, this.environment?.name);
    if (existsSync(filename)) {
      return filename;
    }
    if (this.environment?.production) {
      return InjectScopeInFilePath(filePath, 'production');
    } else {
      return filePath;
    }
  }

  protected interpolateEnvVariables(value: string): string {
    return value.replace(/\${(.+?)}/g, (_, key) => this.config.getOrThrow(key));
  }

}
