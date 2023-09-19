import { Provider } from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
import { AuthenticationService } from './authentication.service';

export function ProvideAuth(): Provider[] {
  return [
    AuthenticationService,
    {
      provide: RxapAuthenticationService,
      useExisting: AuthenticationService,
    },
  ];
}
