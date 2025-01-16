import {
  INestApplication,
  LoggerService,
  NestApplicationOptions,
} from '@nestjs/common';
import type { GlobalPrefixOptions } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DetermineVersion } from '@rxap/nest-utilities';
import * as process from 'node:process';
import { hostname } from 'os';
import { Server } from './server';

export interface MonolithicBootstrapOptions {
  publicUrl: string;
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

  public getPublicPort(config: ConfigService): number {

    const port = this.getPort(config);
    let publicPort = config.get(
      'PUBLIC_PORT',
      this.environment.production ? config.get<string | number>('ROOT_DOMAIN_PORT', port) : port,
    );

    if (typeof publicPort === 'string') {
      if (publicPort.startsWith(':')) {
        publicPort = publicPort.substring(1);
      }
      publicPort = Number(publicPort);
    }

    return publicPort;
  }

  protected buildPublicUrl(config: ConfigService, port: number, globalApiPrefix: string): string {

    let publicUrl = config.get('PUBLIC_URL');

    if (!publicUrl) {
      const publicProtocol = config.get('PUBLIC_PROTOCOL', this.environment.production ? 'https' : 'http');
      const publicDomain = config.get<string>(
        'PUBLIC_DOMAIN',
        this.environment.production ? config.get<string>('ROOT_DOMAIN', hostname()) : 'localhost',
      );
      const publicPort = this.getPublicPort(config);
      publicUrl = `${ publicProtocol }://${ publicDomain }:${ publicPort }`;
    }

    if (!publicUrl.endsWith('/')) {
      publicUrl += '/';
    }

    if (globalApiPrefix) {
      if (globalApiPrefix.startsWith('/')) {
        globalApiPrefix = globalApiPrefix.substring(1);
      }
      if (!globalApiPrefix.endsWith('/')) {
        globalApiPrefix += '/';
      }
      publicUrl += globalApiPrefix;
    }

    return publicUrl;
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
    const publicUrl = this.buildPublicUrl(config, port, globalApiPrefix);

    (config as any).internalConfig.PUBLIC_URL = publicUrl;

    return {
      globalPrefixOptions: {},
      ...this.bootstrapOptions,
      globalApiPrefix,
      publicUrl,
      version: DetermineVersion(this.environment),
      port,
    } as BootstrapOptions;
  }

  protected override listen(app: NestApplicationContext, logger: Logger, options: BootstrapOptions): Promise<any> {
    if (options.globalApiPrefix) {
      logger.log(`Setting global prefix '${ options.globalApiPrefix }'`, 'Bootstrap');
      // TODO : create issue in @nest github project - if options is an empty object the server does not start
      const globalPrefixOptions = options.globalPrefixOptions ?? {};
      if (!options.globalPrefixOptions?.exclude?.length) {
        globalPrefixOptions.exclude ??= [];
        globalPrefixOptions.exclude.push('/health(.*)', '/info', '/openapi');
      }
      logger.log(`Global prefix options: %JSON`, globalPrefixOptions, 'Bootstrap');
      app.setGlobalPrefix(
        options.globalApiPrefix,
        globalPrefixOptions
      );
    }
    logger.log('Starting listening at ' + options.publicUrl, 'Bootstrap');
    return app.listen(options.port, () => {
      logger.log('Listening at ' + options.publicUrl, 'Bootstrap');
    });
  }

}
