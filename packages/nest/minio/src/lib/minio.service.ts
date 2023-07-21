import {
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Client,
  ClientOptions,
  CopyConditions,
} from 'minio';
import { MODULE_OPTIONS_TOKEN } from './configurable-module-builder';

@Injectable()
export class MinioService {

  private readonly minioSdk: Client;
  private readonly copyConditionsImplementation: CopyConditions;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: ClientOptions,
  ) {
    this.minioSdk = new Client(this.options);
    this.copyConditionsImplementation = new CopyConditions();
  }

  public get client(): Client {
    return this.minioSdk;
  }

  public get copyConditions(): CopyConditions {
    return this.copyConditionsImplementation;
  }

}
