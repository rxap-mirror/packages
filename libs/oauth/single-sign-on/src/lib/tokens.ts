import { InjectionToken } from '@angular/core';

export function DefaultRedirectContinueFactory(): string[] {
  return [ '/', 'continue' ];
}

export const RXAP_O_AUTH_SINGLE_SIGN_ON_REDIRECT_CONTINUE = new InjectionToken('rxap/o-auth/single-sign-on/redirect-continue', {
  providedIn: 'root',
  factory:    DefaultRedirectContinueFactory
});
