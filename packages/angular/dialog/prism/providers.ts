import { HttpEventType } from '@angular/common/http';
import {
  Provider,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AnyHttpErrorComponent,
  AnyHttpErrorDialogData,
} from '@rxap/ngx-error';
import { ComponentDialogData } from '../src/lib/component-dialog/types';
import { ConfirmDialogData } from '../src/lib/confirm-dialog/confirm-dialog.component';
import { ErrorCaptureDialogData } from '../src/lib/error-capture-dialog/types';
import { MessageDialogData } from '../src/lib/message-dialog/types';

function demoError(url: string, status: number, statusText: string, message: string): AnyHttpErrorDialogData {
  return {
    method: 'GET',
    url,
    status,
    statusText,
    ok: false,
    name: 'HttpErrorResponse',
    message: `Http failure response for ${ url }: ${ status } ${ statusText }`,
    error: { message },
    headers: { 'content-type': [ 'application/json' ] },
    timestamp: 1767225600000,
    type: HttpEventType.Response,
  } satisfies AnyHttpErrorDialogData;
}

/**
 * A MatDialog passes exactly one data object to the dialog component. The styleguide has only one MAT_DIALOG_DATA
 * provider, so the object contains the data of every dialog component of this library.
 */
const DIALOG_DATA: ConfirmDialogData & MessageDialogData & ComponentDialogData & ErrorCaptureDialogData = {
  // ConfirmDialogData
  message: 'Do you really want to delete the selected item?',
  action: 'Delete',
  // MessageDialogData
  title: 'Delete item',
  actions: [
    { type: 'delete', label: 'Delete', color: 'warn' },
    { type: 'archive', label: 'Archive', color: 'primary' },
  ],
  // ComponentDialogData and ErrorCaptureDialogData: the component reads the error from RXAP_ERROR_DIALOG_ERROR
  component: AnyHttpErrorComponent,
  errorList: signal([
    demoError('https://api.example.com/users/42', 503, 'Service Unavailable', 'The user service is not available'),
    demoError('https://api.example.com/orders/7', 404, 'Not Found', 'The order does not exist'),
    demoError('https://api.example.com/invoices', 500, 'Internal Server Error', 'The invoice could not be created'),
  ]),
};

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: MAT_DIALOG_DATA,
    useValue: DIALOG_DATA,
  },
];
