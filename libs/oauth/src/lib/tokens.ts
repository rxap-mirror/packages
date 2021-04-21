import { InjectionToken } from '@angular/core';

export function DefaultRedirectLoginFactory(): string[] {
  return [ '/', 'authentication', 'login' ];
}

export const RXAP_O_AUTH_REDIRECT_LOGIN = new InjectionToken('rxap/o-auth/redirect-login', {
  providedIn: 'root',
  factory:    DefaultRedirectLoginFactory
});
