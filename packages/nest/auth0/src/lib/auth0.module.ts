import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationClientOptions } from 'auth0';
import { passportJwtSecret } from 'jwks-rsa';
import { Auth0Guard } from './auth0.guard';
import { Auth0Service } from './auth0.service';
import { AUTH0_OPTIONS } from './tokens';
import type { Secret } from 'jsonwebtoken';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthenticationClientOptions>()
  .build();

/**
 * A configurable module that provides Auth0 authentication services for NestJS applications.
 *
 * @summary
 * This module provides authentication services using Auth0, including JWT strategy implementation and Auth0 service configuration.
 *
 * @typeParam T - The type of authentication client options used to configure the Auth0 service.
 *
 * @example
 * ```typescript
 * import { Auth0Module } from './auth0.module';
 *
 * @Module({
 *   imports: [
 *     Auth0Module.register({
 *       domain: 'your-auth0-domain',
 *       clientId: 'your-client-id',
 *       clientSecret: 'your-client-secret',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * import { Auth0Module } from './auth0.module';
 *
 * @Module({
 *   imports: [
 *     Auth0Module.registerAsync({
 *       useFactory: async (configService: ConfigService) => ({
 *         domain: configService.get('AUTH0_DOMAIN'),
 *         clientId: configService.get('AUTH0_CLIENT_ID'),
 *         clientSecret: configService.get('AUTH0_CLIENT_SECRET'),
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @property register - Static method to configure the module with synchronous options
 * @property registerAsync - Static method to configure the module with asynchronous options
 * @property updateProviders - Private static method to update the module's providers and exports
 *
 * @returns A dynamic module configured with Auth0 authentication capabilities, including the Auth0Service and JWT strategy.
 *
 * @throws {@link Error} If the required Auth0 configuration options are invalid or missing.
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secretOrKeyProvider: (_, tokenOrPayload) => {
          return new Promise<Secret>((resolve, reject) => {
            passportJwtSecret({
              cache: true,
              rateLimit: true,
              jwksRequestsPerMinute: 5,
              jwksUri: `${config.get('AUTH0_ISSUER_URL')}.well-known/jwks.json`,
            })(null as any, tokenOrPayload, (err, secret) => {
              if (err) {
                reject(err);
              } else if (secret) {
                resolve(secret);
              } else {
                reject(new Error('No secret found'));
              }
            });
          });
        },
        verifyOptions: {
          audience: config.get('AUTH0_AUDIENCE'),
          issuer: config.get('AUTH0_ISSUER_URL'),
          algorithms: [config.get('AUTH0_ALGORITHM', 'RS256')],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [Auth0Guard],
  exports: [Auth0Guard],
})
export class Auth0Module extends ConfigurableModuleClass {

  /**
   * Registers the Auth0 module with the specified options.
   *
   * @summary This method allows for the configuration of the Auth0 module, enabling the use of the Auth0 service and its associated providers.
   *
   * @param options - The options for configuring the Auth0 module.
   *
   * @returns A dynamic module that includes the Auth0 service and the necessary providers.
   *
   * @example
   * ```typescript
   * import { Auth0Module } from './auth0.module';
   *
   * const auth0Module = Auth0Module.register({
   *   domain: 'your-auth0-domain',
   *   clientId: 'your-client-id',
   *   clientSecret: 'your-client-secret',
   * });
   * ```
   */
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  /**
   * Provides asynchronous configuration options for the Auth0 module.
   *
   * @summary This method allows for dynamic configuration of the Auth0 module, enabling the use of asynchronous providers.
   *
   * @param options - The options for configuring the module asynchronously. This can include factory functions, dependency injection tokens, and other async configuration patterns.
   *
   * @returns A dynamic module that includes the Auth0 service and any other providers specified in the options.
   *
   * @example
   * ```typescript
   * Auth0Module.registerAsync({
   *   useFactory: async () => ({
   *     domain: 'example.auth0.com',
   *     clientId: 'your-client-id',
   *     clientSecret: 'your-client-secret',
   *   }),
   * });
   * ```
   *
   * @example
   * ```typescript
   * Auth0Module.registerAsync({
   *   imports: [ConfigModule],
   *   useFactory: async (configService: ConfigService) => ({
   *     domain: configService.get('AUTH0_DOMAIN'),
   *     clientId: configService.get('AUTH0_CLIENT_ID'),
   *     clientSecret: configService.get('AUTH0_CLIENT_SECRET'),
   *   }),
   *   inject: [ConfigService],
   * });
   * ```
   */
  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push(Auth0Service);
    module.exports ??= [];
    module.exports.push(Auth0Service);
    module.providers.push({
      provide: AUTH0_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN
    });
    return module;
  }

}
