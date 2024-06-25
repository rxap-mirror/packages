import { Provider } from '@angular/core';
import { RXAP_INITIAL_AUTHENTICATION_STATE } from '@rxap/authentication';
import {
  IAuthenticationService,
  RxapAuthenticationService,
} from './authentication.service';
import { Constructor } from '@rxap/utilities';

export function provideAuthentication(
  service: Constructor<IAuthenticationService>,
  ...additionalProviders: Provider[],
): Provider[] {
  return [
    {
      provide: RxapAuthenticationService,
      useClass: service,
    },
    ...additionalProviders,
  ];
}

export function withInitialAuthenticationState(
  state: boolean
): Provider {
  return {
    provide: RXAP_INITIAL_AUTHENTICATION_STATE,
    useValue: state,
  };
}
