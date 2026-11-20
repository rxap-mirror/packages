import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AutoUpdateService {
  private readonly updates = inject<SwUpdate>(SwUpdate);


  public start(): void {
    console.debug('start auto update service');
    this.updates.versionUpdates
      .pipe(
        filter(event => event.type === 'VERSION_READY'),
        tap(() => console.log('start auto app update')),
        tap(() =>
          this.updates.activateUpdate().then(() => {
            console.log('auto app update completed. Reload app.');
            document.location.reload();
          }),
        ),
      )
      .subscribe();
  }

}
