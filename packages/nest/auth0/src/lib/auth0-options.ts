import {
  AuthenticationClientOptions,
  ManagementClientOptionsWithToken,
  ManagementClientOptionsWithClientCredentials
} from 'auth0';

export interface Auth0Options {
  authentication: AuthenticationClientOptions,
  management: ManagementClientOptionsWithToken | ManagementClientOptionsWithClientCredentials,
}
