import {
  INestApplication,
  Logger,
  NestApplicationOptions,
} from '@nestjs/common';
import { GlobalPrefixOptions } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DetermineVersion } from '@rxap/nest-utilities';
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
    return NestFactory.create<T>(this.module, this.options);
  }

  protected override prepareOptions(app: T): B {

    const logger = app.get(Logger);
    const config: ConfigService<unknown> = app.get(ConfigService);

    logger.log('environment: ' +
      JSON.stringify(this.environment, undefined, this.environment.production ? undefined : 2), 'Bootstrap');

    const globalApiPrefix = config.get('GLOBAL_API_PREFIX') ?? config.get('globalPrefix') ?? '';

    logger.debug(
      'Server Config: ' +
      JSON.stringify((config as any).internalConfig, undefined, this.environment.production ? undefined : 2),
      'Bootstrap',
    );

    const port = config.get('PORT') ?? config.get('port') ?? 3333;

    return {
      globalPrefixOptions: {},
      ...this.bootstrapOptions,
      globalApiPrefix,
      publicUrl: (config.get('PUBLIC_URL') ?? 'http://localhost:' + port) +
        (globalApiPrefix ? '/' + globalApiPrefix + '/' : '/'),
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
          { exclude: [ '/health(.*)', '/info' ] } :
          options.globalPrefixOptions,
      );
    }
    return app.listen(options.port, () => {
      logger.log('Listening at ' + options.publicUrl, 'Bootstrap');
    });
  }

}
