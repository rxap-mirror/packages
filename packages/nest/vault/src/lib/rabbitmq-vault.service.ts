import {
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import {
  VaultResponse,
  VaultService
} from './vault.service';

@Injectable()
export class RabbitmqVaultService {

  @Inject(VaultService)
  private readonly vault!: VaultService;

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  @Inject(Logger)
  private readonly logger!: Logger;

  async getCredentials(role = this.config.getOrThrow('RABBITMQ_VAULT_ROLE'), renew = false): Promise<{
    username: string, password: string
  }> {
    this.logger.debug('Using vault to get username and password', 'RabbitmqVaultService');
    let response: VaultResponse<{ username: string, password: string }>;
    try {
      response = await this.vault.read<{ username: string, password: string }>(`rabbitmq/creds/${ role }`);
    } catch (error: unknown) {
      throw this.handleError(error);
    }
    const {
      lease_id,
      lease_duration,
      renewable,
      data
    } = response;

    if (!data) {
      this.logger.fatal(`No data returned from vault in read rabbitmq/creds/${role}`, 'RabbitmqVaultService');
      throw new Error('No data returned from vault in read rabbitmq/creds');
    }

    const { username, password } = data;

    if (renew) {
      this.autoRenewLease(lease_id, lease_duration, renewable);
    }

    return {
      username,
      password
    };

  }

  autoRenewLease(lease_id: string, lease_duration: number, renewable: boolean) {
    if (!renewable) {
      this.logger.error(`Lease '${ lease_id }' for rabbitmq is not renewable`, 'RabbitmqVaultService');
      return;
    }
    const timeout = Math.min(lease_duration * 1000 * 0.9, 2_147_483_647 - 1);
    this.logger.log(`Renewing lease '${ lease_id }' for rabbitmq in ${ timeout / 1000 }s`, 'RabbitmqVaultService');
    setTimeout(() => {
      this.logger.log(`Renewing lease '${ lease_id }' for rabbitmq`, 'RabbitmqVaultService');
      this.vault.renewLease({
        lease_id,
      }).then(response => {
        this.autoRenewLease(response.lease_id, response.lease_duration, response.renewable);
      }).catch(error => {
        throw this.handleError(error);
      });
    }, timeout);
  }

  private handleError(error: unknown) {
    if (isAxiosError(error)) {
      if (error.status === 503) {
        if (error.message?.includes('Vault is sealed')) {
          this.logger.error('Vault is sealed', 'RabbitmqVaultService');
          return new Error('Vault is sealed');
        }
      }
    }
    return error;
  }

}
