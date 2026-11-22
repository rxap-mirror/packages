import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { MinioService } from './minio.service';

/**
 * Class representing a MinioHealthIndicator.
 * @class
 */
@Injectable()
export class MinioHealthIndicator {

  @Inject(MinioService)
  public minioService!: MinioService;

  @Inject(ConfigService)
  public config!: ConfigService;

  @Inject(Logger)
  public logger!: Logger;

  @Inject(HealthIndicatorService)
  public healthIndicatorService!: HealthIndicatorService;

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('minio');
    try {
      const response = await this.minioService.listBuckets();
      if (Array.isArray(response)) {
        return indicator.up();
      }
    } catch (error: any) {
      if ('message' in error && typeof error.message === 'string') {
        this.logger.error(`Failed to list minio buckets (code=${error.code}): ${ error.message || '[empty error message]' }`, error.stack, 'MinioHealthIndicator');
      } else {
        this.logger.error(`Failed to list minio buckets: ${ error }`, undefined, 'MinioHealthIndicator');
      }
    }
    return indicator.down({ message: 'Failed to list minio buckets!' });
  }
}
