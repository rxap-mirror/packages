import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class LogUpdateService {

  constructor(private readonly updates: SwUpdate) {
  }

  public start() {
    console.debug('start log update');
    this.updates.versionUpdates.subscribe(event => {
      console.log('version update event', event);
    });
  }

}

