import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';

@Injectable()
export class MinioHealthIndicator extends HealthIndicator {

  @Inject(MinioService)
  public minioService!: MinioService;

  @Inject(ConfigService)
  public config!: ConfigService;

  @Inject(Logger)
  public logger!: Logger;

  public async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const response = await this.minioService.client.listBuckets();
      if (Array.isArray(response)) {
        return this.getStatus('minio', true);
      }
    } catch (error: any) {
      this.logger.error(`Failed to list minio buckets: ${ error.message }`);
    }
    throw new HealthCheckError(
      'Not yet implemented!',
      this.getStatus('minio', false),
    );
  }
}
