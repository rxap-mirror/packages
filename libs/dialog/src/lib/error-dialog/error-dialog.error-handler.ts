import {
  ErrorHandler,
  Injectable,
  Inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RxapError } from '@rxap/utilities';
import { ErrorDialogComponent } from './error-dialog.component';

@Injectable()
export class ErrorDialogErrorHandler extends ErrorHandler {
  private lastErrorMessage: [RxapError, number] | null = null;

  constructor(
    @Inject(MatDialog)
    private readonly dialog: MatDialog
  ) {
    super();
  }

  public handleError(error: any): void {
    if (error) {
      let rxapError: RxapError | null = null;

      if (error instanceof RxapError) {
        rxapError = error;
      } else if (
        error.hasOwnProperty('rejection') &&
        error['rejection'] instanceof RxapError
      ) {
        rxapError = error['rejection'];
      }

      if (rxapError) {
        console.error(rxapError);

        if (
          !this.lastErrorMessage ||
          this.lastErrorMessage[0].message !== rxapError.message ||
          this.lastErrorMessage[1] + 10000 < Date.now()
        ) {
          this.dialog.open(ErrorDialogComponent, {
            data: { error: rxapError },
            hasBackdrop: true,
          });
          this.lastErrorMessage = [rxapError, Date.now()];
        }

        return;
      }
    }

    super.handleError(error);
  }
}
