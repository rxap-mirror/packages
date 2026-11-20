import { InjectionToken } from '@angular/core';

export const RXAP_AUTHORIZATION_SCOPE = new InjectionToken<string>('rxap-authorization/scope');

export const RXAP_DISABLE_AUTHORIZATION = new InjectionToken<boolean>('rxap-authorization/disable');