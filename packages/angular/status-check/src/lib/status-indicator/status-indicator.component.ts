import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { $localize } from '@angular/localize/init';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { ConfigService } from '@rxap/config';
import {
  debounceTime,
  interval,
  merge,
  Subject,
  Subscription,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import {
  filter,
  map,
} from 'rxjs/operators';
import { StatusCheckService } from '../status-check.service';
import { STATUS_INDICATOR_INTERVAL } from '../tokens';

@Component({
  selector: 'rxap-status-indicator',
  standalone: true,
  imports: [ RouterLink, NgClass, MatTooltipModule ],
  templateUrl: './status-indicator.component.html',
  styleUrls: [ './status-indicator.component.scss' ],
})
export class StatusIndicatorComponent implements OnInit, OnDestroy {

  public readonly services: string[] = [];
  public readonly status: Signal<string>;
  public readonly tooltip: Signal<string>;
  queryParams: Signal<Record<string, any> | undefined>;
  countdown = signal(inject(STATUS_INDICATOR_INTERVAL));
  private readonly statusIndicatorInterval = inject(STATUS_INDICATOR_INTERVAL);
  private readonly config = inject(ConfigService);
  private readonly statusCheckService = inject(StatusCheckService);
  private readonly router = inject(Router);
  /**
   * used to interrupt the countdown on a component destruction
   */
  private readonly destroy$ = new Subject<void>();

  private readonly retry$ = new Subject<void>();

  private subscription?: Subscription;

  constructor() {
    this.services = Object
      .entries(this.config.get('api', {}))
      .filter(([ _, value ]: [ string, any ]) => typeof value === 'object' && value && !!value['statusCheck'])
      .map(([ key ]) => key);
    this.queryParams = toSignal(this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => ({
        url: event.urlAfterRedirects,
        service: this.services,
      })),
    ));
    const status$ = this.statusCheckService.getStatus(this.services).pipe(
      map(status => status.status),
    );
    const manualRetry$ = this.retry$.pipe(
      switchMap(() => this.statusCheckService
                          .getStatus(this.services)
                          .pipe(
                            map(status => status.status),
                            debounceTime(500),
                          ),
      ));
    this.status = toSignal(merge(status$, manualRetry$), { initialValue: 'loading' });
    this.tooltip = computed(() => {
      const status = this.status();
      return $localize`:@@status-check-tooltip:app status` + `: ${ status }`;
    });
  }

  initiateCountdown() {
    this.subscription = interval(1000)
      .pipe(
        take(this.statusIndicatorInterval),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: val => this.countdown.set(this.statusIndicatorInterval - val),
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          error: () => {},
          complete: () => {
            this.retry$.next();
            this.countdown.set(this.statusIndicatorInterval);
            // Your API check logic here
            this.initiateCountdown();
          },
        },
      );
  }

  ngOnInit() {
    this.initiateCountdown();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription?.unsubscribe();
  }

}
