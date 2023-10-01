import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const RXAP_AUTHENTICATION_DEACTIVATED = new InjectionToken<boolean>('rxap/authentication/deactivated');

export interface AuthenticationAccessToken extends Record<string, any> {
  token: string;
  valid?: boolean;
}

export const RXAP_AUTHENTICATION_ACCESS_TOKEN = new InjectionToken<BehaviorSubject<AuthenticationAccessToken | null>>(
  'rxap/authentication/access-token',
  {
    providedIn: 'root',
    factory: () => new BehaviorSubject<AuthenticationAccessToken | null>(null),
  },
);

export const RXAP_INITIAL_AUTHENTICATION_STATE = new InjectionToken<boolean>('rxap/authentication/initial-state', {
  providedIn: 'root',
  factory: () => false,
});
