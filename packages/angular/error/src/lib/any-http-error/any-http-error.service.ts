import { ComponentType } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { ErrorCaptureService } from '../error-capture.service';
import { IErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { AnyHttpErrorDialogData } from './any-http-error-dialog-data';
import { AnyHttpErrorComponent } from './any-http-error.component';

@Injectable({ providedIn: 'root' })
export class AnyHttpErrorService<Error extends AnyHttpErrorDialogData = AnyHttpErrorDialogData>
  extends ErrorCaptureService<Error> {

  protected readonly component: ComponentType<IErrorDialogComponent> = AnyHttpErrorComponent;

  override compare(a: Error, b: Error): boolean {
    return a.url === b.url && a.method === b.method && a.status === b.status && a.message === b.message;
  }

}
