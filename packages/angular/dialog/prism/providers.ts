import { Provider } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogData } from '../src/lib/confirm-dialog/confirm-dialog.component';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: MAT_DIALOG_DATA,
    useValue: {
      message: 'Do you really want to delete the selected item?',
      action: 'Delete',
    } satisfies ConfirmDialogData,
  },
];
