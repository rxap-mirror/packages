import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import {
  RXAP_AUTHENTICATION_DEACTIVATED,
  RxapAuthenticationService,
} from '@rxap/authentication';
import { AuthenticationService } from './authentication.service';

export async function AuthenticationGuard(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

  const isAuthDisabled = inject(RXAP_AUTHENTICATION_DEACTIVATED, { optional: true }) ?? false;

  if (isAuthDisabled) {
    console.warn('Authentication is disabled!');
    return true;
  }

  const authService = inject(RxapAuthenticationService);

  if (!(authService instanceof AuthenticationService)) {
    throw new Error(
      'The RxapAuthenticationService must be an instance of AuthenticationService. Ensure the ProvideAuth() function is used in the application config.');
  }

  if (await authService.isAuthenticated()) {
    return true;
  }

  authService.signIn();
  return false;

}
