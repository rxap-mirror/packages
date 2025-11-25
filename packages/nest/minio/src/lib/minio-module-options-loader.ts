import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientOptions } from 'minio';
import { Agent } from 'https';
import { readFileSync } from 'fs';

@Injectable()
export class MinioModuleOptionsLoader
  implements ConfigurableModuleOptionsFactory<ClientOptions, 'create'> {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  @Inject(Logger)
  private readonly logger!: Logger;

  create(): ClientOptions {
    const useSSL = this.config.get<boolean>('MINIO_USE_SSL', false);
    let agent: Agent | undefined;

    if (useSSL) {
      const caCertsPath = this.config.get<string>('MINIO_CA_CERTS') ?? this.config.get('NODE_EXTRA_CA_CERTS');
      if (caCertsPath) {
        try {
          const ca = readFileSync(caCertsPath);
          this.logger.verbose(`Loaded CA certificate for Minio client from ${caCertsPath}`);
          agent = new Agent({
            ca,
          });
        } catch (e) {
          this.logger.error(`Could not load CA certificate for Minio client from ${caCertsPath}`, e);
        }
      } else {
        this.logger.debug('No CA certificate for Minio client provided. Using default CA certificates.', 'MinioModuleOptionsLoader::create');
      }
    } else {
      this.logger.warn('Enable SSL for Minio client to avoid man-in-the-middle attacks (MINIO_USE_SSL=true)', 'MinioModuleOptionsLoader::create');
    }

    return {
      endPoint: this.config.get('MINIO_END_POINT', 'minio'),
      port: this.config.get('MINIO_PORT', 9000),
      useSSL: useSSL,
      accessKey: this.config.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.config.get('MINIO_SECRET_KEY', 'minioadmin'),
      transportAgent: agent,
    };
  }
}
