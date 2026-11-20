import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { LifeCycleService } from '@rxap/life-cycle';
import { interval } from 'rxjs';
import {
  startWith,
  tap,
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CheckForUpdateService {
  private readonly lifeCycle = inject<LifeCycleService>(LifeCycleService);
  private readonly updates = inject<SwUpdate>(SwUpdate);


  private _started = false;

  public start(): void {
    if (this._started) {
      console.warn('check for update already started');
      return;
    }
    this._started = true;
    if (this.updates.isEnabled) {

      console.debug('start check for update');

      this.updates.checkForUpdate();

      this
        .lifeCycle
        .whenReady(() => interval(15 * 60 * 1000)
          .pipe(
            startWith(null),
            tap(() => console.log('check for update')),
            tap(() => this.updates.checkForUpdate()),
          ),
        )
        .subscribe();

    } else {
      console.warn('service worker updates are not enabled');
    }
  }

}
