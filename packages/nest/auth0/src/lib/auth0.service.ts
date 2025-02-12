import { Inject, Injectable } from '@nestjs/common';
import { AuthenticationClient, AuthenticationClientOptions } from 'auth0';
import { AUTH0_OPTIONS } from './tokens';

/**
 * A service that extends Auth0's AuthenticationClient to provide authentication capabilities in NestJS applications.
 *
 * @summary
 * Provides Auth0 authentication services with additional token management functionality.
 *
 * @typeParam T - The type of authentication client options used to configure the Auth0 service.
 *
 * @param options - The configuration options for the Auth0 client including domain, clientId, and clientSecret.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class AppService {
 *   constructor(private readonly auth0Service: Auth0Service) {}
 *
 *   async getToken() {
 *     return this.auth0Service.requestToken('https://api.example.com');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Manual instantiation (not recommended in NestJS)
 * const auth0Service = new Auth0Service({
 *   domain: 'your-domain.auth0.com',
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret'
 * });
 * ```
 *
 * @throws {@link Error} If the Auth0 client initialization fails due to invalid configuration options.
 *
 * @property requestToken - Method to obtain an access token for a specific audience using client credentials flow.
 */
@Injectable()
export class Auth0Service extends AuthenticationClient {
  constructor(
    @Inject(AUTH0_OPTIONS)
    options: AuthenticationClientOptions
  ) {
    super(options);
  }

  /**
   * Requests an access token from Auth0 using the client credentials grant flow.
   *
   * @summary
   * This method obtains an access token for a specific API audience using the OAuth 2.0 client credentials flow.
   *
   * @param audience - The unique identifier of the API for which the access token is being requested. This is typically the API's URL or identifier registered in Auth0.
   *
   * @returns A Promise that resolves to a string containing the JWT access token that can be used to authenticate requests to the specified API audience.
   *
   * @throws {@link Error} If the token request fails due to invalid credentials, network issues, or other Auth0 API errors.
   *
   * @example
   * ```typescript
   * const auth0Service = new Auth0Service(options);
   * try {
   *   const token = await auth0Service.requestToken('https://api.example.com');
   *   // Use the token for API requests
   *   console.log(token);
   * } catch (error) {
   *   console.error('Failed to obtain access token:', error);
   * }
   * ```
   */
  async requestToken(audience: string): Promise<string> {
    const {
      data: { access_token },
    } = await this.oauth.clientCredentialsGrant({ audience });
    return access_token;
  }
}
