import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import {
  OPEN_FGA_CLIENT_OPTIONS,
  OpenFgaOptions,
  OpenFgaService,
} from '@rxap/nest-openfga';

@Injectable()
export class OpenfgaHealthIndicator extends HealthIndicator implements OnApplicationBootstrap {
  @Inject(OpenFgaService)
  private readonly openfga!: OpenFgaService;

  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  @Inject(OPEN_FGA_CLIENT_OPTIONS)
  readonly options!: OpenFgaOptions;

  public async isHealthy(silentError = false): Promise<HealthIndicatorResult> {
    const storeId = this.config.get('FGA_STORE_ID');
    if (!storeId) {
      this.logger.error('FGA_STORE_ID not set!', 'OpenfgaHealthIndicator');
      throw new HealthCheckError(
        'FGA_STORE_ID not set!',
        this.getStatus('openfga', false)
      );
    }
    const authorizationModelId = this.config.get('FGA_AUTHORIZATION_MODEL_ID');
    if (!authorizationModelId) {
      this.logger.error(
        'FGA_AUTHORIZATION_MODEL_ID not set!',
        'OpenfgaHealthIndicator'
      );
      throw new HealthCheckError(
        'FGA_AUTHORIZATION_MODEL_ID not set!',
        this.getStatus('openfga', false)
      );
    }
    try {
      await this.openfga.checkValidApiConnection({
        storeId,
        authorizationModelId,
      });
    } catch (e: any) {
      if (!silentError) {
        this.logger.error(
          `OpenFga health check failed: ${ e.message }`,
          'OpenfgaHealthIndicator'
        );
      }
      throw new HealthCheckError(e.message, this.getStatus('openfga', false));
    }
    return this.getStatus('openfga', true);
  }

  async onApplicationBootstrap() {
    this.logger.debug('Check if OpenFGA is ready', 'OpenfgaHealthIndicator::onApplicationBootstrap');
    const retryInterval = this.options.retryInterval ?? 1000 * 10;
    const maxStartupTime = this.options.maxStartupTime ?? 1000 * 60 * 2; // 2min
    const maxRetry = maxStartupTime / retryInterval;
    let counter = 0;
    do {
      try {
        const result = await this.isHealthy(true);
        if (result['openfga'].status === 'up') {
          this.logger.log('OpenFGA is ready', 'OpenfgaHealthIndicator::onApplicationBootstrap');
          return;
        }
      } catch (e: any) {
        this.logger.warn(`OpenFGA is not ready (${counter}/${maxRetry}). Retry in ${retryInterval}ms: ${e.message}`, 'OpenfgaHealthIndicator::onApplicationBootstrap');
      }
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    } while (++counter < maxRetry);
  }

}
