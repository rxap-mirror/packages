import {
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService
} from '@nestjs/terminus';
import {
  TokenLookupSelfData,
  VaultResponse,
  VaultService
} from './vault.service';

@Injectable()
export class VaultHealthIndicator {

  @Inject(VaultService)
  private readonly vaultService!: VaultService;

  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(HealthIndicatorService)
  private readonly healthIndicatorService!: HealthIndicatorService;

  public async isHealthy(): Promise<HealthIndicatorResult> {

    const indicator = this.healthIndicatorService.check('vault');

    let lookupSelf: VaultResponse<TokenLookupSelfData>;

    try {
      lookupSelf = await this.vaultService.tokenLookupSelf();
    } catch (error: any) {
      this.logger.error(`Failed to lookup self token! ${ error.message }`, 'VaultHealthIndicator');
      return indicator.down({ message: 'Failed to lookup self token!', error: error.message });
    }

    if (!lookupSelf.data) {
      this.logger.error('Failed to lookup self token! Response data empty', 'VaultHealthIndicator');
      return indicator.down({
        message: 'Failed to lookup self token!',
        error: 'Failed to lookup self token! Response data empty'
      });
    }

    const { expire_time } = lookupSelf.data;

    // check if the token is about to expire in the next 5 minutes
    if (expire_time && new Date(expire_time).getTime() - Date.now() < 5 * 60 * 1000) {
      this.logger.error('Vault token is about to expire!', 'VaultHealthIndicator');
      return indicator.down({ message: 'Vault token is about to expire!', data: lookupSelf.data });
    }

    return indicator.up({ data: lookupSelf.data });
  }
}
