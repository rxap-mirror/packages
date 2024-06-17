import { Injectable } from '@angular/core';
import { ErrorCaptureService } from '../error-capture.service';
import { AngularErrorDialogData } from './angular-error-dialog-data';
import { AngularErrorComponent } from './angular-error.component';

@Injectable({ providedIn: 'root' })
export class AngularErrorService extends ErrorCaptureService<AngularErrorDialogData> {

  protected readonly component = AngularErrorComponent;

  override compare(a: AngularErrorDialogData, b: AngularErrorDialogData): boolean {
    return true;
  }

}
