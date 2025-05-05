import {
  inject,
  Injectable,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SwUpdate,
  VersionEvent,
} from '@angular/service-worker';
import {
  filter,
  Observable,
  take,
} from 'rxjs';
import {
  concatMap,
  tap,
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SnackbarUpdateService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly updates = inject(SwUpdate);

  public start(): void {
    console.debug('start dialog update service');
    this.updates.versionUpdates
        .pipe(
          filter(event => event.type === 'VERSION_READY'),
          concatMap((event) => this.openUpdateSnackBar(event)),
          tap(() => console.log('start app update')),
          tap(() =>
            this.updates.activateUpdate().then(() => {
              console.log('app update completed. Reload app.');
              document.location.reload();
            }),
          ),
        )
        .subscribe();
  }

  private openUpdateSnackBar(event: VersionEvent): Observable<any> {
    console.debug('open update snack bar');
    const ref = this.snackBar.open($localize`A new version is available`, $localize`Update`);
    return ref.afterDismissed().pipe(
      take(1),
    );
  }
}
