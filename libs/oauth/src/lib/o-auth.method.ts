import { Method } from '@rxap/utilities';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

export interface OAuthMethodWithUsernamePasswordParameters {
  grantType?: string;
  username: string;
  password: string;
  secret: string;
  authEndpoint: string;
}

export interface OAuthMethodWithRefreshTokenParameters {
  grantType?: string;
  refreshToken: string;
  secret: string;
  authEndpoint: string;
}

export type OAuthMethodParameters = (OAuthMethodWithUsernamePasswordParameters | OAuthMethodWithRefreshTokenParameters) & { withCredentials?: boolean };

export function IsOAuthMethodWithRefreshTokenParameters(parameters: OAuthMethodParameters): parameters is OAuthMethodWithRefreshTokenParameters {
  // eslint-disable-next-line no-prototype-builtins
  return parameters.hasOwnProperty('refreshToken');
}

export function IsOAuthMethodWithUsernamePasswordParameters(parameters: OAuthMethodParameters): parameters is OAuthMethodWithUsernamePasswordParameters {
  // eslint-disable-next-line no-prototype-builtins
  return parameters.hasOwnProperty('username') && parameters.hasOwnProperty('password');
}

export function AssertOAuthMethodWithUsernamePasswordParameters(parameters: OAuthMethodParameters): asserts parameters is OAuthMethodWithUsernamePasswordParameters {
  if (!IsOAuthMethodWithUsernamePasswordParameters(parameters)) {
    throw new Error('The grant type password requires the parameters username and password');
  }
}

export function AssertOAuthMethodWithRefreshTokenParameters(parameters: OAuthMethodParameters): asserts parameters is OAuthMethodWithRefreshTokenParameters {
  if (!IsOAuthMethodWithRefreshTokenParameters(parameters)) {
    throw new Error('The grant type refresh token requires the parameters refreshToken');
  }
}

export function AssertOAuthMethodParameters(parameters: any): asserts parameters is OAuthMethodParameters {
  if (!parameters.authEndpoint) {
    throw new Error('The authEndpoint parameter must be defined');
  }
  if (!parameters.secret) {
    throw new Error('The secret parameter must be defined');
  }
  if (parameters.grantType) {
    switch (parameters.grantType) {

      case 'password':
        AssertOAuthMethodWithUsernamePasswordParameters(parameters);
        break;

      case 'refresh_token':
        AssertOAuthMethodWithRefreshTokenParameters(parameters);
        break;

      default:
        throw new Error(`The grant type '${parameters.grantType}' is not supported`);

    }
  } else {
    if (
      !IsOAuthMethodWithRefreshTokenParameters(parameters) &&
      !IsOAuthMethodWithUsernamePasswordParameters(parameters)
    ) {
      throw new Error('Either the refresh token or the username and password must be defined');
    }
  }
}

export interface OAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface OAuthMethodResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: Date;
}

@Injectable({ providedIn: 'root' })
export class OAuthMethod implements Method<OAuthMethodResponse, OAuthMethodParameters> {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  public async call(parameters: OAuthMethodParameters): Promise<OAuthMethodResponse> {

    AssertOAuthMethodParameters(parameters);

    const params    = new URLSearchParams();
    const grantType = this.getGrantType(parameters);
    params.append('grant_type', grantType);
    switch (grantType) {

      case 'password':
        AssertOAuthMethodWithUsernamePasswordParameters(parameters);
        params.append('username', parameters.username);
        params.append('password', parameters.password);
        break;

      case 'refresh_token':
        AssertOAuthMethodWithRefreshTokenParameters(parameters);
        params.append('refresh_token', parameters.refreshToken);
        break;

      default:
        throw new Error('Not supported grant type');

    }

    const headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      Authorization:  `Basic ${parameters.secret}`
    });

    const response = await this.http
                               .post<OAuthResponse>(parameters.authEndpoint, params.toString(), {
                                 headers,
                                 withCredentials: parameters.withCredentials ?? true
                               })
                               .toPromise();

    return {
      accessToken:  response.access_token,
      refreshToken: response.refresh_token,
      expiresIn:    response.expires_in,
      expiresAt:    new Date(Date.now() + response.expires_in * 1000)
    };

  }

  private getGrantType(parameters: OAuthMethodParameters) {
    if (parameters.grantType) {
      return parameters.grantType;
    }

    if (IsOAuthMethodWithRefreshTokenParameters(parameters)) {
      return 'refresh_token';
    }

    if (IsOAuthMethodWithUsernamePasswordParameters(parameters)) {
      return 'password';
    }

    throw new Error('Could not guess the grant type');
  }

}
