import {
  INestApplication,
  LoggerService,
  NestApplicationOptions,
} from '@nestjs/common';
import type { NestHybridApplicationOptions } from '@nestjs/common/interfaces';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Environment } from '@rxap/nest-utilities';
import {
  coerceArray,
  isPromise,
} from '@rxap/utilities';
import {
  Monolithic,
  MonolithicBootstrapOptions,
} from './monolithic';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HybridBootstrapOptions extends MonolithicBootstrapOptions {}

export type MicroserviceOptionsInput<Logger extends LoggerService, NestApplicationContext extends INestApplication = INestApplication, MO extends MicroserviceOptions = MicroserviceOptions, MHO extends NestHybridApplicationOptions = NestHybridApplicationOptions> = MO | Promise<MO> | ((app: NestApplicationContext, logger: Logger, options: HybridBootstrapOptions, hybridOptions: MHO) => MO | Promise<MO>);

export class Hybrid<
  Options extends NestApplicationOptions,
  Logger extends LoggerService,
  NestApplicationContext extends INestApplication = INestApplication,
  MO extends MicroserviceOptions = MicroserviceOptions,
  MHO extends NestHybridApplicationOptions = NestHybridApplicationOptions,
> extends Monolithic<Options, Logger, NestApplicationContext, HybridBootstrapOptions> {

  protected readonly microserviceOptions: Array<MicroserviceOptionsInput<Logger, NestApplicationContext, MO, MHO>>;

  constructor(
    module: any,
    environment: Environment,
    options: Options,
    bootstrapOptions: Partial<HybridBootstrapOptions> = {},
    microserviceOptions: MicroserviceOptionsInput<Logger, NestApplicationContext, MO, MHO> | Array<MicroserviceOptionsInput<Logger, NestApplicationContext, MO, MHO>>,
    protected readonly hybridOptions?: MHO,
  ) {
    super(module, environment, options, bootstrapOptions);
    this.microserviceOptions = coerceArray(microserviceOptions);
  }

  protected override async listen(app: NestApplicationContext, logger: Logger, options: HybridBootstrapOptions): Promise<any> {
    for (let i = 0; i < this.microserviceOptions.length; i++) {
      let microserviceOptions = this.microserviceOptions[i];
      const hybridOptions = Array.isArray(this.hybridOptions) ? this.hybridOptions[i] : this.hybridOptions;
      if (typeof microserviceOptions === 'function') {
        try {
          logger.log(`Resolving microservice options [${i}]`, 'Bootstrap');
          microserviceOptions = microserviceOptions(app, logger, options, hybridOptions);
        } catch (e: any) {
          logger.error(`Failed to resolve microservice options: ${e.message}`, e.stack, 'Bootstrap');
          process.exit(1);
        }
      }
      if (isPromise(microserviceOptions)) {
        try {
          logger.log(`Awaiting async microservice options [${i}]`, 'Bootstrap');
          microserviceOptions = await microserviceOptions;
        } catch (e: any) {
          logger.error(`Failed to resolve async microservice options: ${e.message}`, e.stack, 'Bootstrap');
          process.exit(1);
        }
      }
      logger.log(`Connecting microservice [${i}]`, 'Bootstrap');
      app.connectMicroservice(microserviceOptions, hybridOptions);
    }
    logger.log('Starting all microservices', 'Bootstrap');
    await app.startAllMicroservices();
    return super.listen(app, logger, options);
  }

}
