import { ComponentType } from '@angular/cdk/overlay';
import { WritableSignal } from '@angular/core';

export interface ErrorCaptureDialogData<Error = any> {
  errorList: WritableSignal<Error[]>;
  component: ComponentType<any>;
}
