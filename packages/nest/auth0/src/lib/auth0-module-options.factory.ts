import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticationClientOptions } from 'auth0';

@Injectable()
export class Auth0ModuleOptionsFactory implements ConfigurableModuleOptionsFactory<AuthenticationClientOptions, 'create'> {

  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  @Inject(Logger)
  protected readonly logger!: Logger;

  async create(): Promise<AuthenticationClientOptions> {
    this.logger.verbose('Create auth0 client options', 'Auth0ClientModuleOptionsFactory');
    return {
      domain: this.config.get('AUTH0_DOMAIN')!,
      clientId: this.config.get('AUTH0_CLIENT_ID')!,
      clientSecret: this.config.get('AUTH0_CLIENT_SECRET')!,
    };
  }

}
