import {
  INestApplication,
  Logger,
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

export type MicroserviceOptionsInput<T extends INestApplication = INestApplication, MO extends MicroserviceOptions = MicroserviceOptions, MHO extends NestHybridApplicationOptions = NestHybridApplicationOptions> = MO | Promise<MO> | ((app: T, logger: Logger, options: HybridBootstrapOptions, hybridOptions: MHO) => MO | Promise<MO>);

export class Hybrid<
  O extends NestApplicationOptions,
  T extends INestApplication = INestApplication,
  MO extends MicroserviceOptions = MicroserviceOptions,
  MHO extends NestHybridApplicationOptions = NestHybridApplicationOptions,
> extends Monolithic<O, T, HybridBootstrapOptions> {

  protected readonly microserviceOptions: Array<MicroserviceOptionsInput<T, MO, MHO>>;

  constructor(
    module: any,
    environment: Environment,
    options: O,
    bootstrapOptions: Partial<HybridBootstrapOptions> = {},
    microserviceOptions: MicroserviceOptionsInput<T, MO, MHO> | Array<MicroserviceOptionsInput<T, MO, MHO>>,
    protected readonly hybridOptions?: MHO,
  ) {
    super(module, environment, options, bootstrapOptions);
    this.microserviceOptions = coerceArray(microserviceOptions);
  }

  protected override async listen(app: T, logger: Logger, options: HybridBootstrapOptions): Promise<any> {
    for (let i = 0; i < this.microserviceOptions.length; i++) {
      let microserviceOptions = this.microserviceOptions[i];
      const hybridOptions = Array.isArray(this.hybridOptions) ? this.hybridOptions[i] : this.hybridOptions;
      if (typeof microserviceOptions === 'function') {
        try {
          logger.verbose(`Resolving microservice options [${i}]`, 'Bootstrap');
          microserviceOptions = microserviceOptions(app, logger, options, hybridOptions);
        } catch (e: any) {
          logger.error(`Failed to resolve microservice options: ${e.message}`, e.stack, 'Bootstrap');
          process.exit(1);
        }
      }
      if (isPromise(microserviceOptions)) {
        try {
          logger.verbose(`Awaiting async microservice options [${i}]`, 'Bootstrap');
          microserviceOptions = await microserviceOptions;
        } catch (e: any) {
          logger.error(`Failed to resolve async microservice options: ${e.message}`, e.stack, 'Bootstrap');
          process.exit(1);
        }
      }
      logger.debug(`Connecting microservice [${i}]`, 'Bootstrap');
      app.connectMicroservice(microserviceOptions, hybridOptions);
    }
    logger.debug('Starting all microservices', 'Bootstrap');
    await app.startAllMicroservices();
    return super.listen(app, logger, options);
  }

}
