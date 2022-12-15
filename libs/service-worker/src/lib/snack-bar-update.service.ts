import {
  Injectable,
  NgModule,
  Inject
} from '@angular/core';
import {
  SwUpdate,
  UpdateAvailableEvent
} from '@angular/service-worker';
import {
  concatMap,
  tap
} from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  MatLegacySnackBar as MatSnackBar,
  MatLegacySnackBarModule as MatSnackBarModule
} from '@angular/material/legacy-snack-bar';
import { log } from '@rxap/utilities/rxjs';

@Injectable({
  providedIn: 'root',
})
export class SnackBarUpdateService {
  constructor(
    @Inject(MatSnackBar)
    private readonly snackBar: MatSnackBar,
    @Inject(SwUpdate)
    private readonly updates: SwUpdate
  ) {}

  public start(): void {
    console.debug('start prompt update');
    this.updates.available
      .pipe(
        concatMap((event) => this.openSnackBar(event)),
        log('start app update'),
        tap(() =>
          this.updates.activateUpdate().then(() => {
            console.log('app update completed. Reload app.');
            document.location.reload();
          })
        )
      )
      .subscribe();
  }

  private openSnackBar(event: UpdateAvailableEvent): Observable<void> {
    const snackBarRef = this.snackBar.open('New update available', 'update', {
      duration: 25 * 1000,
      data: event,
    });

    return snackBarRef.onAction();
  }
}

@NgModule({
  exports: [MatSnackBarModule],
})
export class SnackBarUpdateServiceModule {
  constructor(
    @Inject(SnackBarUpdateService)
    snackBarUpdate: SnackBarUpdateService
  ) {
    snackBarUpdate.start();
  }
}
