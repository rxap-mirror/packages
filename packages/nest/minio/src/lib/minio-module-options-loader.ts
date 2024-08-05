import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientOptions } from 'minio';

@Injectable()
export class MinioModuleOptionsLoader
  implements ConfigurableModuleOptionsFactory<ClientOptions, 'create'> {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  create(): ClientOptions {
    return {
      endPoint: this.config.getOrThrow('MINIO_END_POINT'),
      port: this.config.get('MINIO_PORT', 9000),
      useSSL: this.config.get('MINIO_USE_SSL', false),
      accessKey: this.config.getOrThrow('MINIO_ACCESS_KEY'),
      secretKey: this.config.getOrThrow('MINIO_SECRET_KEY'),
    };
  }

}
