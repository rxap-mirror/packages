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
import { log } from '@rxap/utilities';
import { Observable } from 'rxjs';
import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarUpdateService {

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly updates: SwUpdate
  ) {}

  public start(): void {
    console.debug('start prompt update');
    this.updates.available.pipe(
      concatMap(event => this.openSnackBar(event)),
      log('start app update'),
      tap(() => this.updates.activateUpdate().then(() => {
        console.log('app update completed. Reload app.');
        document.location.reload();
      }))
    ).subscribe();
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
  exports: [
    MatSnackBarModule,
  ]
})
export class SnackBarUpdateServiceModule {

  constructor(
    @Inject(SnackBarUpdateService)
    snackBarUpdate: SnackBarUpdateService
  ) {
    snackBarUpdate.start();
  }

}
