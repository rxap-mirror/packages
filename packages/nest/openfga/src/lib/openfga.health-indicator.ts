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
import { OpenFgaService } from './open-fga.service';

@Injectable()
export class OpenfgaHealthIndicator {
  @Inject(OpenFgaService)
  private readonly openfga!: OpenFgaService;

  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  @Inject(HealthIndicatorService)
  private readonly healthIndicatorService!: HealthIndicatorService;

  public async isHealthy(silentError = false): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('openfga');
    const storeId = this.config.get('FGA_STORE_ID');
    if (!storeId) {
      this.logger.error('FGA_STORE_ID not set!', 'OpenfgaHealthIndicator');
      return indicator.down({ message: 'FGA_STORE_ID not set!' });
    }
    const authorizationModelId = this.config.get('FGA_AUTHORIZATION_MODEL_ID');
    if (!authorizationModelId) {
      this.logger.error(
        'FGA_AUTHORIZATION_MODEL_ID not set!',
        'OpenfgaHealthIndicator'
      );
      return indicator.down({ message: 'FGA_AUTHORIZATION_MODEL_ID not set!' });
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
      return indicator.down({ message: e.message });
    }
    return indicator.up();
  }

}
