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
      endPoint: this.config.get('MINIO_END_POINT', 'minio'),
      port: this.config.get('MINIO_PORT', 9000),
      useSSL: this.config.get('MINIO_USE_SSL', false),
      accessKey: this.config.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.config.get('MINIO_SECRET_KEY', 'minioadmin'),
    };
  }

}
