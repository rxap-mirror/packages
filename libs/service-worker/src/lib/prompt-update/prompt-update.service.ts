import { Injectable } from '@angular/core';
import {
  SwUpdate,
  UpdateAvailableEvent
} from '@angular/service-worker';
import {
  concatMap,
  filter,
  tap,
  map,
  first
} from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PromptUpdateComponent } from './prompt-update.component';
import { Observable } from 'rxjs';
import { log } from '@rxap/utilities';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {

  constructor(
    private readonly dialog: MatDialog,
    private readonly updates: SwUpdate
  ) {

  }

  public start(): void {
    console.debug('start prompt update');
    this.updates.available.pipe(
      concatMap(event => this.promptUser(event)),
      filter(Boolean),
      log('start app update'),
      tap(() => this.updates.activateUpdate().then(() => {
        console.log('app update completed. Reload app.');
        document.location.reload();
      }))
    ).subscribe();
  }

  private promptUser(event: UpdateAvailableEvent): Observable<boolean> {
    const dialogRef = this.dialog.open<PromptUpdateComponent, any, boolean>(
      PromptUpdateComponent,
      {
        data: event
      }
    );

    return dialogRef.afterClosed().pipe(map(Boolean), first());
  }

}
