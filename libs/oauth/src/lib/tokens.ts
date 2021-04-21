import { InjectionToken } from '@angular/core';

export function DefaultRedirectSignInFactory(): string[] {
  return [ '/', 'authentication', 'login' ];
}

export const RXAP_O_AUTH_REDIRECT_SIGN_IN = new InjectionToken('rxap/o-auth/redirect-sign-in', {
  providedIn: 'root',
  factory:    DefaultRedirectSignInFactory
});

export function DefaultRedirectSignOutFactory(): string[] {
  return [ '/', 'authentication', 'login' ];
}

export const RXAP_O_AUTH_REDIRECT_SIGN_OUT = new InjectionToken('rxap/o-auth/redirect-sign-out', {
  providedIn: 'root',
  factory:    DefaultRedirectSignOutFactory
});
