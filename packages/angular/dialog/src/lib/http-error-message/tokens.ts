import {
  InjectionToken,
  isDevMode,
} from '@angular/core';

export const RXAP_DIALOG_HTTP_ERROR_MESSAGE_IS_PRODUCTION = new InjectionToken(
  'rxap/dialog/http-error-message/is-production', {
    providedIn: 'root',
    factory: () => isDevMode(),
  });
