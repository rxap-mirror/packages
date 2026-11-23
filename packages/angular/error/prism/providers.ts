import { HttpEventType } from '@angular/common/http';
import {
  Provider,
  signal,
} from '@angular/core';
import { AnyHttpErrorDialogData } from '../src/lib/any-http-error/any-http-error-dialog-data';
import { AnyHttpErrorComponent } from '../src/lib/any-http-error/any-http-error.component';
import { CodeHttpErrorDialogData } from '../src/lib/code-http-error/code-http-error-dialog-data';
import { AngularErrorDialogData } from '../src/lib/error/angular-error-dialog-data';
import {
  RXAP_ERROR_DIALOG_COMPONENT,
  RXAP_ERROR_DIALOG_DATA,
  RXAP_ERROR_DIALOG_ERROR,
} from '../src/lib/tokens';

/**
 * The demo error is shared by all error components of the library. Therefore it contains the properties
 * of the http errors (any, code, message, open api) and of the angular error.
 */
const DEMO_ERROR = {
  method: 'GET',
  url: 'https://api.example.com/users/42',
  status: 503,
  statusText: 'Service Unavailable',
  ok: false,
  name: 'HttpErrorResponse',
  message: 'Http failure response for https://api.example.com/users/42: 503 Service Unavailable',
  error: { message: 'The user service is not available' },
  errorCode: 'USER_SERVICE_UNAVAILABLE',
  body: { id: 42 },
  headers: { 'content-type': [ 'application/json' ] },
  timestamp: 1767225600000,
  type: HttpEventType.Response,
  stack: 'HttpErrorResponse: Http failure response for https://api.example.com/users/42: 503 Service Unavailable\n    at UserService.load (user.service.ts:21:9)',
  tags: { route: '/users/42' },
  contexts: { user: { id: '42' } },
  extra: { retry: 3 },
} satisfies AnyHttpErrorDialogData & AngularErrorDialogData & Pick<CodeHttpErrorDialogData, 'errorCode'>;

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: RXAP_ERROR_DIALOG_ERROR,
    useValue: DEMO_ERROR,
  },
  {
    // the error dialog lists all errors and renders the active one with the dialog component
    provide: RXAP_ERROR_DIALOG_DATA,
    useValue: signal<unknown[]>([
      DEMO_ERROR,
      { ...DEMO_ERROR, status: 500, statusText: 'Internal Server Error', message: 'Http failure response for https://api.example.com/users/42: 500 Internal Server Error' },
      { ...DEMO_ERROR, status: 404, statusText: 'Not Found', message: 'Http failure response for https://api.example.com/users/42: 404 Not Found' },
    ]),
  },
  {
    provide: RXAP_ERROR_DIALOG_COMPONENT,
    useValue: AnyHttpErrorComponent,
  },
];
