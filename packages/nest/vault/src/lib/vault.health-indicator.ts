import {
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult
} from '@nestjs/terminus';
import {
  TokenLookupSelfData,
  VaultResponse,
  VaultService
} from './vault.service';

@Injectable()
export class VaultHealthIndicator extends HealthIndicator {

  @Inject(VaultService)
  private readonly vaultService!: VaultService;

  @Inject(Logger)
  private readonly logger!: Logger;

  public async isHealthy(): Promise<HealthIndicatorResult> {

    let lookupSelf: VaultResponse<TokenLookupSelfData>;

    try {
      lookupSelf = await this.vaultService.tokenLookupSelf();
    } catch (error: any) {
      this.logger.error(`Failed to lookup self token! ${ error.message }`, 'VaultHealthIndicator');
      throw new HealthCheckError(
        'Failed to lookup self token!',
        this.getStatus('vault', false, { error: error.message })
      );
    }

    if (!lookupSelf.data) {
      this.logger.error('Failed to lookup self token! Response data empty', 'VaultHealthIndicator');
      throw new HealthCheckError(
        'Failed to lookup self token!',
        this.getStatus('vault', false, { error: 'Failed to lookup self token! Response data empty' })
      );
    }

    const { expire_time } = lookupSelf.data;

    // check if the token is about to expire in the next 5 minutes
    if (expire_time && new Date(expire_time).getTime() - Date.now() < 5 * 60 * 1000) {
      this.logger.error('Vault token is about to expire!', 'VaultHealthIndicator');
      throw new HealthCheckError(
        'Vault token is about to expire!',
        this.getStatus('vault', false, { data: lookupSelf.data })
      );
    }

    return this.getStatus('vault', true, { data: lookupSelf.data });
  }
}
