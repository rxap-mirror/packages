import {
  INestMicroservice,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DetermineVersion } from '@rxap/nest-utilities';
import { Server } from './server';

export interface MicroserviceBootstrapOptions {
  version: string;
}

export class Microservice<O extends object = MicroserviceOptions>
  extends Server<O, INestMicroservice, MicroserviceBootstrapOptions> {

  protected override create(): Promise<INestMicroservice> {
    return NestFactory.createMicroservice(this.module, this.options);
  }

  protected override prepareOptions(app: INestMicroservice): MicroserviceBootstrapOptions {
    const logger = app.get(Logger);
    const config: ConfigService<unknown> = app.get(ConfigService);

    logger.log('environment: ' +
      JSON.stringify(this.environment, undefined, this.environment.production ? undefined : 2), 'Bootstrap');

    logger.debug(
      'Server Config: ' +
      JSON.stringify((config as any).internalConfig, undefined, this.environment.production ? undefined : 2),
      'Bootstrap',
    );

    return {
      version: DetermineVersion(this.environment),
    };
  }

  protected override listen(app: INestMicroservice, logger: Logger, options: MicroserviceBootstrapOptions) {
    return app.listen();
  }

}
