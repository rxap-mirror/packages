import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CredentialsMethod } from '@openfga/sdk';
import { OpenFgaOptions } from './open-fga.options';

@Injectable()
export class OpenFgaModuleOptionsFactory
  implements ConfigurableModuleOptionsFactory<OpenFgaOptions, 'create'>
{
  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  @Inject(Logger)
  protected readonly logger!: Logger;

  async create(): Promise<OpenFgaOptions> {
    this.logger.verbose(
      'Create OpenFGA client options',
      'OpenFgaClientModuleOptionsFactory'
    );
    const options: OpenFgaOptions = {
      apiUrl: this.config.getOrThrow('FGA_API_URL'),
    };

    const storeId = this.config.get('FGA_STORE_ID');
    const authorizationModelId = this.config.get('FGA_AUTHORIZATION_MODEL_ID');

    if (storeId) {
      options.storeId = storeId;
    }

    if (authorizationModelId) {
      options.authorizationModelId = authorizationModelId;
    }

    const token = this.config.get('FGA_API_TOKEN');
    if (token) {
      options.credentials = {
        method: CredentialsMethod.ApiToken,
        config: {
          token
        }
      };
    }

    return options;
  }
}
