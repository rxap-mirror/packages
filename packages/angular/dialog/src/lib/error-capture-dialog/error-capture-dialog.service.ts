import { ComponentType } from '@angular/cdk/overlay';
import {
  inject,
  Injectable,
  WritableSignal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RXAP_ERROR_DIALOG_DISABLED } from '@rxap/ngx-error';
import {
  EMPTY,
  finalize,
  Observable,
  take,
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { ErrorCaptureDialogComponent } from './error-capture-dialog.component';
import { ErrorCaptureDialogData } from './types';

@Injectable({ providedIn: 'root' })
export class ErrorCaptureDialogService<Error = any> {

  protected readonly dialog = inject(MatDialog);
  protected readonly disabled = inject(RXAP_ERROR_DIALOG_DISABLED);

  open(component: ComponentType<any>, errorList: WritableSignal<Error[]>): Observable<void> {
    if (this.disabled) {
      console.debug(`ErrorCaptureDialogService is disabled.`, { errorList: errorList() });
      return EMPTY;
    }
    const ref = this.dialog.open<ErrorCaptureDialogComponent, ErrorCaptureDialogData>(ErrorCaptureDialogComponent, {
      data: {
        errorList,
        component
      }
    });
    return new Observable<void>(subscriber => {
      const subscription = ref.afterClosed().pipe(
        take(1),
        tap(() => {
          subscriber.next();
          subscriber.complete();
        }),
        finalize(() => {
          ref.close();
        })
      ).subscribe();
      return () => {
        subscription.unsubscribe();
      };
    });

  }

}
