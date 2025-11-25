import {
  INestMicroservice,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DetermineVersion } from '@rxap/nest-utilities';
import { Server } from './server';

export interface MicroserviceBootstrapOptions {
  version: string;
}

export class Microservice<Logger extends LoggerService, Options extends object = MicroserviceOptions>
  extends Server<Options, INestMicroservice, MicroserviceBootstrapOptions, Logger> {

  protected override create(): Promise<INestMicroservice> {
    return NestFactory.createMicroservice(this.module, this.options);
  }

  protected override prepareOptions(app: INestMicroservice, logger: Logger, config: ConfigService): MicroserviceBootstrapOptions {
    logger.log(`environment: ${ JSON.stringify(this.environment) }`, 'Bootstrap');

    logger.verbose?.('Process Environment: %JSON', process.env, 'Bootstrap');

    logger.debug?.(`Server Config: ${(config as any).internalConfig}`, 'Bootstrap');

    return {
      version: DetermineVersion(this.environment),
    };
  }

  protected override listen(app: INestMicroservice, logger: Logger, options: MicroserviceBootstrapOptions) {
    return app.listen();
  }

}
