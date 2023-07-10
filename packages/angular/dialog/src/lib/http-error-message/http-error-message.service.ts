import {
  Inject,
  Injectable,
} from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  debounceTime,
  tap,
} from 'rxjs/operators';
import { HttpErrorMessageComponent } from './http-error-message.component';

@Injectable()
export class HttpErrorMessageService {
  public showErrorMessage$ = new Subject();

  constructor(
    @Inject(MatDialog)
    public dialog: MatDialog,
  ) {
    this.showErrorMessage$
        .pipe(
          debounceTime(500),
          tap((error) =>
            this.dialog.open(HttpErrorMessageComponent, { data: error }),
          ),
        )
        .subscribe();
  }

  public showErrorMessage(error: any) {
    this.showErrorMessage$.next(error);
  }
}
