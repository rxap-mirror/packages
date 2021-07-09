import {
  Injectable,
  NgModule,
  Inject
} from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import {
  tap,
  startWith
} from 'rxjs/operators';
import { interval } from 'rxjs';
import { LifeCycleService } from '@rxap/life-cycle';
import { log } from '@rxap/utilities/rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckForUpdateService {

  constructor(
    @Inject(LifeCycleService) private readonly lifeCycle: LifeCycleService,
    @Inject(SwUpdate) private readonly updates: SwUpdate,
  ) {}

  public start(): void {
    if (this.updates.isEnabled) {

      console.debug('start check for update');

      this.updates.checkForUpdate();

      this
        .lifeCycle
        .whenReady(() => interval(15 * 60 * 1000)
          .pipe(
            startWith(null),
            log('check for update'),
            tap(() => this.updates.checkForUpdate()),
          ),
        )
        .subscribe();

    }
  }

}

@NgModule()
export class CheckForUpdateModule {

  constructor(@Inject(CheckForUpdateService) checkForUpdate: CheckForUpdateService) {
    checkForUpdate.start();
  }

}
