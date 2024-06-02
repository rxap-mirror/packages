import {
  INestApplication,
  Logger,
  NestApplicationOptions,
} from '@nestjs/common';
import type { NestHybridApplicationOptions } from '@nestjs/common/interfaces';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Environment } from '@rxap/nest-utilities';
import { coerceArray } from '@rxap/utilities';
import {
  Monolithic,
  MonolithicBootstrapOptions,
} from './monolithic';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HybridBootstrapOptions extends MonolithicBootstrapOptions {}

export class Hybrid<
  O extends NestApplicationOptions,
  T extends INestApplication = INestApplication,
  MO extends MicroserviceOptions = MicroserviceOptions,
  MHO extends NestHybridApplicationOptions = NestHybridApplicationOptions,
> extends Monolithic<O, T, HybridBootstrapOptions> {

  protected readonly microserviceOptions: MO[];

  constructor(
    module: any,
    environment: Environment,
    options: O,
    bootstrapOptions: Partial<HybridBootstrapOptions> = {},
    microserviceOptions: MO | MO[],
    protected readonly hybridOptions?: MHO,
  ) {
    super(module, environment, options, bootstrapOptions);
    this.microserviceOptions = coerceArray(microserviceOptions);
  }

  protected override async listen(app: T, logger: Logger, options: HybridBootstrapOptions): Promise<any> {
    for (let i = 0; i < this.microserviceOptions.length; i++) {
      const microserviceOptions = this.microserviceOptions[i];
      const hybridOptions = Array.isArray(this.hybridOptions) ? this.hybridOptions[i] : this.hybridOptions;
      app.connectMicroservice(microserviceOptions, hybridOptions);
    }
    await app.startAllMicroservices();
    return super.listen(app, logger, options);
  }

}
