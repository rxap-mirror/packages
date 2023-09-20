import { Provider } from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  AUTH_CONFIG,
  AuthConfig,
} from 'angular-oauth2-oidc';
import { AuthenticationService } from './authentication.service';

export function ProvideAuth(...withConfigs: Array<Provider | Provider[]>): Provider[] {
  return [
    AuthenticationService,
    {
      provide: RxapAuthenticationService,
      useExisting: AuthenticationService,
    },
    ...withConfigs.flat(),
  ];
}

export function withAuthConfig(config: AuthConfig): Provider {
  return {
    provide: AUTH_CONFIG,
    useValue: config,
  };
}
