import { ComponentType } from '@angular/cdk/overlay';
import {
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  ErrorCaptureDialogService,
  IErrorCaptureDialogService,
} from './error-capture-dialog.service';
import { IErrorDialogComponent } from './error-dialog/error-dialog.component';
import { RXAP_ERROR_CAPTURE_DIALOG_SERVICE } from './tokens';

@Injectable()
export abstract class ErrorCaptureService<Error = any> {

  protected abstract readonly component: ComponentType<IErrorDialogComponent>;
  private readonly errorCaptureDialogService = inject<IErrorCaptureDialogService<Error>>(
    RXAP_ERROR_CAPTURE_DIALOG_SERVICE, { optional: true }) ?? inject(ErrorCaptureDialogService);
  private errorList: Array<WritableSignal<Error[]>> = [];

  push(error: Error) {
    if (this.errorList.length) {
      const last = this.errorList[this.errorList.length - 1];
      const value = last();
      if (value.some(e => this.compare(e, error))) {
        last.update(value => {
          value.push(error);
          return value.slice();
        });
        return;
      }
    }
    const newList = signal([ error ]);
    this.errorList.push(newList);
    this.errorCaptureDialogService.open(this.component, newList);
  }

  abstract compare(a: Error, b: Error): boolean;

}
