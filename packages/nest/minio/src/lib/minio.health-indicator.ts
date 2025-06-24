import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { MinioService } from '@rxap/nest-minio';

/**
 * Class representing a MinioHealthIndicator.
 * @class
 * @inheritDoc
 */
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
      const response = await this.minioService.listBuckets();
      if (Array.isArray(response)) {
        return this.getStatus('minio', true);
      }
    } catch (error: any) {
      if ('message' in error && typeof error.message === 'string') {
        this.logger.error(`Failed to list minio buckets (code=${error.code}): ${ error.message || '[empty error message]' }`, error.stack, 'MinioHealthIndicator');
      } else {
        this.logger.error(`Failed to list minio buckets: ${ error }`, undefined, 'MinioHealthIndicator');
      }
    }
    throw new HealthCheckError(
      'Not yet implemented!',
      this.getStatus('minio', false),
    );
  }
}
