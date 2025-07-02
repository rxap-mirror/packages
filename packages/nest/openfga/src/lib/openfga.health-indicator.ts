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
import { OpenFgaService } from './open-fga.service';

@Injectable()
export class OpenfgaHealthIndicator extends HealthIndicator {
  @Inject(OpenFgaService)
  private readonly openfga!: OpenFgaService;

  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(ConfigService)
  private readonly config!: ConfigService;

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

}
