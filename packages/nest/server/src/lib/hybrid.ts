import {
  INestApplication,
  Logger,
  NestApplicationOptions,
} from '@nestjs/common';
import { NestHybridApplicationOptions } from '@nestjs/common/interfaces';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Environment } from '@rxap/nest-utilities';
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

  constructor(
    module: any,
    environment: Environment,
    options: O,
    bootstrapOptions: Partial<HybridBootstrapOptions> = {},
    protected readonly microserviceOptions: MO,
    protected readonly hybridOptions?: MHO,
  ) {
    super(module, environment, options, bootstrapOptions);
  }

  protected override async listen(app: T, logger: Logger, options: HybridBootstrapOptions): Promise<any> {
    app.connectMicroservice(this.microserviceOptions, this.hybridOptions);
    await app.startAllMicroservices();
    return super.listen(app, logger, options);
  }

}
