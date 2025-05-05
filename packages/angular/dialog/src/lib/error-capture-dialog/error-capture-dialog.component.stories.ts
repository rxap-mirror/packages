import { signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnyHttpErrorComponent } from '@rxap/ngx-error';
import { Meta, moduleMetadata } from '@storybook/angular';
import { ErrorCaptureDialogComponent } from './error-capture-dialog.component';

export default {
  title: 'ErrorCaptureDialogComponent',
  component: ErrorCaptureDialogComponent,
  decorators: [
    moduleMetadata({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            errorList: signal([new Error('Test Error'), new Error('Another Error')]),
            component: AnyHttpErrorComponent,
          }
        }
      ],
    })
  ]
} as Meta<ErrorCaptureDialogComponent>;

export const Primary = {
  args: {},
};
