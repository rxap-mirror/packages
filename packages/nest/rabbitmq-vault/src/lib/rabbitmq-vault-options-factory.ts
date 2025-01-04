import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { RabbitmqOptionsFactory } from '@rxap/nest-rabbitmq';
import { RabbitmqVaultService } from './rabbitmq-vault.service';

@Injectable()
export class RabbitmqVaultOptionsFactory extends RabbitmqOptionsFactory {

  @Inject(RabbitmqVaultService)
  protected readonly vault!: RabbitmqVaultService;

  override async getCredentials(): Promise<{ username: string, password: string } | null> {
    const credentials = await super.getCredentials();

    if (credentials) {
      return credentials;
    }

    if (this.config.get('RABBITMQ_VAULT_ROLE')) {
      this.logger.debug('Using vault to get username and password', 'RabbitMQModuleConfigFactory');
      const role = this.config.getOrThrow('RABBITMQ_VAULT_ROLE');
      return this.vault.getCredentials(role, true);
    }

    return null;

  }

}
