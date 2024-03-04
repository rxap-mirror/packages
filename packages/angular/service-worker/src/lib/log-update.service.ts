import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogUpdateService {

  constructor(private readonly updates: SwUpdate) {
  }

  public start() {
    console.debug('start log update');
    this.updates.versionUpdates.pipe(
      filter(event => event.type !== 'NO_NEW_VERSION_DETECTED'),
    ).subscribe(event => {
      console.log('version update event', event);
    });
  }

}

