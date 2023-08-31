import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  isDevMode,
  OnDestroy,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { log } from '@rxap/rxjs';
import {
  interval,
  merge,
  Subject,
  Subscription,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import {
  map,
  tap,
} from 'rxjs/operators';
import { StatusCheckService } from '../status-check.service';

const CHECK_INTERVAL = isDevMode() ? 5 : 60;

@Component({
  selector: 'rxap-status-check',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './status-check.component.html',
  styleUrls: [ './status-check.component.scss' ],
})
export class StatusCheckComponent implements OnInit, OnDestroy {

  services: Signal<Array<{ name: string, status: string | undefined }>>;

  url: Signal<string | null>;

  countdown = signal(CHECK_INTERVAL);

  /**
   * used to interrupt the countdown on a component destruction
   */
  private readonly destroy$ = new Subject<void>();

  private readonly retry$ = new Subject<void>();

  private subscription?: Subscription;

  private readonly statusCheckService = inject(StatusCheckService);

  constructor(
    private readonly route: ActivatedRoute,
  ) {
    this.route.queryParamMap.pipe(
      tap(qp => console.log({
        one: qp.get('service'),
        all: qp.getAll('service'),
      })),
    ).subscribe();
    this.url = toSignal(
      this.route.queryParamMap.pipe(
        map(map => map.get('url')),
      ),
      { initialValue: null },
    );

    const services$ = this.route.queryParamMap.pipe(
      map(map => map.getAll('service')),
      log('send'),
      switchMap(services =>
        this.statusCheckService.getStatus(services).pipe(
          map(status => [
            ...Object.entries(status.info ?? {})
                     .map(([ name, status ]) => ({
                       name,
                       status: status.status,
                     })),
            ...Object.entries(status.error ?? {})
                     .map(([ name, status ]) => ({
                       name,
                       status: status.status,
                     })),
          ].sort((a, b) => a.name.localeCompare(b.name))),
        ),
      ),
      log('data'),
    );
    const manualRetry$ = this.retry$.pipe(switchMap(() => services$));
    this.services = toSignal(merge(services$, manualRetry$), { initialValue: [] });
  }

  ngOnInit() {
    this.initiateCountdown();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription?.unsubscribe();
  }

  initiateCountdown() {
    this.subscription = interval(1000)
      .pipe(
        take(CHECK_INTERVAL),
        takeUntil(this.destroy$),
      )
      .subscribe({
          next: val => this.countdown.set(CHECK_INTERVAL - val),
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          error: () => {},
          complete: () => {
            this.retry$.next();
            this.countdown.set(CHECK_INTERVAL);
            // Your API check logic here
            this.initiateCountdown();
          },
        },
      );
  }

}
