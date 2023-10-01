import {
  INestApplication,
  Logger,
  NestApplicationOptions,
} from '@nestjs/common';
import { GlobalPrefixOptions } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DetermineVersion } from '@rxap/nest-utilities';
import { hostname } from 'os';
import { Server } from './server';

export interface MonolithicBootstrapOptions {
  publicUrl: string;
  port: number;
  version: string;
  globalApiPrefix?: string;
  globalPrefixOptions: GlobalPrefixOptions;
}

export class Monolithic<O extends NestApplicationOptions, T extends INestApplication = INestApplication, B extends MonolithicBootstrapOptions = MonolithicBootstrapOptions>
  extends Server<O, T, B> {

  protected override create(): Promise<T> {
    this.options.bufferLogs ??= true;
    this.options.autoFlushLogs ??= true;
    return NestFactory.create<T>(this.module, this.options);
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
      this.environment.production ? config.get<string | number>('ROOT_DOMAIN_PORT', 443) : port,
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

  protected override prepareOptions(app: T, logger: Logger, config: ConfigService): B {

    logger.log('environment: ' +
      JSON.stringify(this.environment, undefined, this.environment.production ? undefined : 2), 'Bootstrap');

    logger.debug(
      'Server Config: ' +
      JSON.stringify((config as any).internalConfig, undefined, this.environment.production ? undefined : 2),
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
    } as B;
  }

  protected override listen(app: T, logger: Logger, options: B): Promise<any> {
    if (options.globalApiPrefix) {
      // TODO : create issue in @nest github project - if options is an empty object the server does not start
      app.setGlobalPrefix(
        options.globalApiPrefix,
        !options.globalPrefixOptions?.exclude?.length ?
          { exclude: [ '/health(.*)', '/info', '/openapi' ] } :
          options.globalPrefixOptions,
      );
    }
    return app.listen(options.port, () => {
      logger.log('Listening at ' + options.publicUrl, 'Bootstrap');
    });
  }

}
