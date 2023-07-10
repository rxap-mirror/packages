import {
  Inject,
  Injectable,
  NgModule,
} from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import {
  startWith,
  tap,
} from 'rxjs/operators';
import { interval } from 'rxjs';
import { LifeCycleService } from '@rxap/life-cycle';

@Injectable({
  providedIn: 'root',
})
export class CheckForUpdateService {

  constructor(
    @Inject(LifeCycleService) private readonly lifeCycle: LifeCycleService,
    @Inject(SwUpdate) private readonly updates: SwUpdate,
  ) {
  }

  public start(): void {
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

    }
  }

}

@NgModule({})
export class CheckForUpdateModule {

  constructor(@Inject(CheckForUpdateService) checkForUpdate: CheckForUpdateService) {
    checkForUpdate.start();
  }

}
