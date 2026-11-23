import {
  AuthenticationClientOptions,
  ManagementClientOptionsWithToken,
  ManagementClientOptionsWithClientCredentials
} from 'auth0/legacy';

export interface Auth0Options {
  authentication: AuthenticationClientOptions,
  management: ManagementClientOptionsWithToken | ManagementClientOptionsWithClientCredentials,
  disabled?: boolean;
}
