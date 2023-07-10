import {Inject, Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {Client, ClientOptions, CopyConditions} from 'minio';
import {MODULE_OPTIONS_TOKEN} from './configurable-module-builder';

@Injectable()
export class MinioService implements OnApplicationBootstrap {

  private minioSdk!: Client;
  private copyConditionsImplementation!: CopyConditions;

  @Inject(MODULE_OPTIONS_TOKEN)
  private options!: ClientOptions;

  public get client(): Client {
    return this.minioSdk;
  }

  public get copyConditions(): CopyConditions {
    return this.copyConditionsImplementation;
  }

  onApplicationBootstrap() {
    this.minioSdk = new Client(this.options);
    this.copyConditionsImplementation = new CopyConditions();
  }

}
