import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth0Options } from './auth0-options';

/**
 * Creates an instance of `AuthenticationClientOptions` for Auth0 configuration.
 *
 * @summary
 * This factory class is responsible for providing the configuration options required to initialize the Auth0 client.
 *
 * @typeParam T - The type of the options to be created.
 * @typeParam K - The method name used to create the options.
 *
 * @throws {@link Error} if any required configuration values are missing.
 *
 * @property config - The configuration service used to retrieve Auth0 settings.
 * @property logger - The logger instance used for logging information during the creation of options.
 *
 * @example
 * ```typescript
 * const factory = new Auth0ModuleOptionsFactory();
 * const options = await factory.create();
 * ```
 *
 * @summary
 * This method retrieves configuration values from the `ConfigService` and constructs an `AuthenticationClientOptions` object.
 *
 * @returns A promise that resolves to an `AuthenticationClientOptions` object containing the Auth0 configuration.
 *
 * @example
 * ```typescript
 * const options = await auth0ModuleOptionsFactory.create();
 * ```
 */
@Injectable()
export class Auth0ModuleOptionsFactory implements ConfigurableModuleOptionsFactory<Auth0Options, 'create'> {

  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  @Inject(Logger)
  protected readonly logger!: Logger;

  /**
   * Creates the authentication client options for Auth0.
   *
   * @summary
   * This method retrieves configuration values from the `ConfigService` and constructs an `AuthenticationClientOptions` object.
   *
   * @returns A promise that resolves to an `AuthenticationClientOptions` object containing the Auth0 configuration.
   *
   * @throws {@link Error} if any required configuration values are missing.
   *
   * @example
   * ```typescript
   * const options = await auth0ModuleOptionsFactory.create();
   * ```
   */
  async create(): Promise<Auth0Options> {
    this.logger.verbose('Create auth0 client options', 'Auth0ClientModuleOptionsFactory');
    const authentication = {
      domain: this.config.get('AUTH0_DOMAIN')!,
      clientId: this.config.get('AUTH0_CLIENT_ID')!,
      clientSecret: this.config.get('AUTH0_CLIENT_SECRET')!,
    };
    const management = this.config.get('AUTH0_MANAGEMENT_TOKEN') ? {
      domain: this.config.get('AUTH0_DOMAIN')!,
      token: this.config.get('AUTH0_MANAGEMENT_TOKEN')!,
    } : {
      domain: this.config.get('AUTH0_DOMAIN')!,
      clientId: this.config.get('AUTH0_CLIENT_ID')!,
      clientSecret: this.config.get('AUTH0_CLIENT_SECRET')!,
    };
    return {
      authentication,
      management,
      disabled: this.config.get('AUTH0_DISABLED', false),
    };
  }

}
