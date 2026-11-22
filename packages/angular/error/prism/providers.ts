import { HttpEventType } from '@angular/common/http';
import { Provider } from '@angular/core';
import { AnyHttpErrorDialogData } from '../src/lib/any-http-error/any-http-error-dialog-data';
import { RXAP_ERROR_DIALOG_ERROR } from '../src/lib/tokens';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: RXAP_ERROR_DIALOG_ERROR,
    useValue: {
      method: 'GET',
      url: 'https://api.example.com/users/42',
      status: 503,
      statusText: 'Service Unavailable',
      ok: false,
      name: 'HttpErrorResponse',
      message: 'Http failure response for https://api.example.com/users/42: 503 Service Unavailable',
      error: { message: 'The user service is not available' },
      headers: { 'content-type': [ 'application/json' ] },
      timestamp: 1767225600000,
      type: HttpEventType.Response,
    } satisfies AnyHttpErrorDialogData,
  },
];
