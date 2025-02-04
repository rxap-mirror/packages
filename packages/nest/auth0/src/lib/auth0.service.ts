import { Inject, Injectable } from '@nestjs/common';
import { AuthenticationClient, AuthenticationClientOptions } from 'auth0';
import { AUTH0_OPTIONS } from './tokens';

@Injectable()
export class Auth0Service extends AuthenticationClient {
  constructor(
    @Inject(AUTH0_OPTIONS)
    options: AuthenticationClientOptions
  ) {
    super(options);
  }

  async requestToken(audience: string): Promise<string> {
    const {
      data: { access_token },
    } = await this.oauth.clientCredentialsGrant({ audience });
    return access_token;
  }
}
