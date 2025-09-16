import {
  INestApplication,
  LoggerService,
  NestApplicationOptions,
} from '@nestjs/common';
import type { GlobalPrefixOptions } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DetermineVersion } from '@rxap/nest-utilities';
import { hostname } from 'os';
import { Server } from './server';

export interface MonolithicBootstrapOptions {
  /**
   * @deprecated use apiUrl instead
   */
  publicUrl: string;
  apiUrl: string;
  apiBaseUrl: string;
  port: number;
  version: string;
  globalApiPrefix?: string;
  globalPrefixOptions: GlobalPrefixOptions;
}

export class Monolithic<Options extends NestApplicationOptions, Logger extends LoggerService, NestApplicationContext extends INestApplication = INestApplication, BootstrapOptions extends MonolithicBootstrapOptions = MonolithicBootstrapOptions>
  extends Server<Options, NestApplicationContext, BootstrapOptions, Logger> {

  protected override create(): Promise<NestApplicationContext> {
    this.options.bufferLogs ??= true;
    this.options.autoFlushLogs ??= true;
    return NestFactory.create<NestApplicationContext>(this.module, this.options);
  }

  protected getPort(config: ConfigService): number {
    return Math.floor(Number(config.get<number | string>('PORT') ?? config.get<number | string>('port', 3000)));
  }

  protected getGlobalApiPrefix(config: ConfigService): string {
    return config.get('GLOBAL_API_PREFIX') ?? config.get('globalPrefix') ?? '';
  }

  /**
   * Returns the public port of the api.
   * This is the public port used to access the api from the internet.
   * @param config
   * @param port
   */
  public getApiPort(config: ConfigService, port = this.getPort(config)): number {

    let apiPort = config.get(
      'API_PORT',
      this.environment.production ? config.get<string | number>('ROOT_DOMAIN_PORT', port) : port,
    );

    if (typeof apiPort === 'string') {
      if (apiPort.startsWith(':')) {
        apiPort = apiPort.substring(1);
      }
      apiPort = Number(apiPort);
    }

    return apiPort;
  }

  /**
   * Builds the public url of the api.
   * This is the public url used to access the api from the internet.
   * @param config
   * @protected
   */
  protected buildApiUrl(config: ConfigService): string {

    let apiUrl = config.get('API_URL');

    if (!apiUrl) {
      const publicProtocol = config.get('API_PROTOCOL', this.environment.production ? 'https' : 'http');
      const publicDomain = config.get<string>(
        'API_DOMAIN',
        this.environment.production ? config.get<string>('ROOT_DOMAIN', hostname()) : 'localhost',
      );
      const publicPort = this.getApiPort(config);
      apiUrl = `${ publicProtocol }://${ publicDomain }:${ publicPort }`;
    }

    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.substring(0, apiUrl.length - 1);
    }

    return apiUrl;
  }

  protected buildApiBaseUrl(config: ConfigService, apiUrl: string, globalApiPrefix: string): string {
    let apiBaseUrl = config.get('API_BASE_URL');

    if (!apiBaseUrl) {
      if (!apiUrl.endsWith('/')) {
        apiUrl += '/';
      }

      if (globalApiPrefix) {
        if (globalApiPrefix.startsWith('/')) {
          globalApiPrefix = globalApiPrefix.substring(1);
        }
        if (!globalApiPrefix.endsWith('/')) {
          globalApiPrefix += '/';
        }
        apiUrl += globalApiPrefix;
      }
      apiBaseUrl = apiUrl;
    }

    return apiBaseUrl.replace(/\/$/, '');
  }

  protected override prepareOptions(app: NestApplicationContext, logger: Logger, config: ConfigService): BootstrapOptions {

    logger.log(`environment: ${ JSON.stringify(this.environment) }`, 'Bootstrap');

    logger.verbose?.('Process Environment: %JSON', process.env, 'Bootstrap');

    logger.debug?.(
      'Server Config: %JSON',
      (config as any).internalConfig,
      'Bootstrap',
    );

    const globalApiPrefix = this.getGlobalApiPrefix(config);
    const port = this.getPort(config);
    const apiUrl = this.buildApiUrl(config);
    const apiBaseUrl = this.buildApiBaseUrl(config, apiUrl, globalApiPrefix);

    (config as any).internalConfig.API_URL = apiUrl;
    (config as any).internalConfig.API_BASE_URL = apiBaseUrl;

    return {
      globalPrefixOptions: {},
      ...this.bootstrapOptions,
      globalApiPrefix,
      publicUrl: apiBaseUrl,
      apiUrl,
      apiBaseUrl,
      version: DetermineVersion(this.environment),
      port,
    } as BootstrapOptions;
  }

  protected setGlobalApiPrefix(app: NestApplicationContext, logger: Logger, options: BootstrapOptions) {
    if (options.globalApiPrefix) {
      logger.log(`Setting global prefix '${ options.globalApiPrefix }'`, 'Bootstrap');
      // TODO : create issue in @nest github project - if options is an empty object the server does not start
      const globalPrefixOptions = options.globalPrefixOptions ?? {};
      if (!options.globalPrefixOptions?.exclude?.length) {
        globalPrefixOptions.exclude ??= [];
        globalPrefixOptions.exclude.push('/health{/*path}', '/info', '/openapi');
      }
      logger.log(`Global prefix options: %JSON`, globalPrefixOptions, 'Bootstrap');
      app.setGlobalPrefix(
        options.globalApiPrefix,
        globalPrefixOptions
      );
    }
  }

  protected override listen(app: NestApplicationContext, logger: Logger, options: BootstrapOptions): Promise<any> {
    this.setGlobalApiPrefix(app, logger, options);
    logger.log(`Starting listening at ${ options.apiUrl }`, 'Bootstrap');
    return app.listen(options.port, () => {
      logger.log(`Listening at ${ options.apiUrl }`, 'Bootstrap');
    });
  }

}
