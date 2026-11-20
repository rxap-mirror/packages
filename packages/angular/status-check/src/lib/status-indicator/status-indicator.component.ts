import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
  switchMap,
} from 'rxjs';
import {
  filter,
  map,
} from 'rxjs/operators';
import { StatusCheckService } from '../status-check.service';
import { STATUS_INDICATOR_INTERVAL } from '../tokens';

declare const $localize: any;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rxap-status-indicator',
    imports: [RouterLink, NgClass, MatTooltipModule],
    templateUrl: './status-indicator.component.html',
    styleUrls: ['./status-indicator.component.scss']
})
export class StatusIndicatorComponent {

  public readonly services: string[] = [];
  public readonly status: Signal<string>;
  public readonly tooltip: Signal<string>;
  queryParams: Signal<Record<string, any> | undefined>;
  countdown = signal(inject(STATUS_INDICATOR_INTERVAL));
  private readonly statusIndicatorInterval = inject(STATUS_INDICATOR_INTERVAL);
  private readonly config = inject(ConfigService);
  private readonly statusCheckService = inject(StatusCheckService);
  private readonly router = inject(Router);

  private readonly retry$ = new Subject<void>();

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
      if ($localize && typeof $localize === 'function') {
        return $localize`:@@status-check-tooltip:app status` + `: ${ status }`;
      } else {
        return `app status: ${ status }`;
      }
    });

    // restart the countdown every interval and trigger a retry when it reaches zero
    interval(1000).pipe(takeUntilDestroyed()).subscribe(tick => {
      const val = tick % this.statusIndicatorInterval;
      this.countdown.set(this.statusIndicatorInterval - val);
      if (val === this.statusIndicatorInterval - 1) {
        this.retry$.next();
      }
    });
  }

}
