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
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import {
  debounceTime,
  interval,
  merge,
  Subject,
  switchMap,
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiStatus,
  StatusCheckService,
} from '../status-check.service';
import { STATUS_CHECK_INTERVAL } from '../tokens';
import { Showcase } from '@ng-prism/core';

export interface ServiceStatus {
  name: string,
  status: string | undefined,
  message?: string
}

@Showcase<StatusCheckComponent>({
  title: 'Status Check',
  category: 'Status Check',
  description: 'Page that lists the health of the backend services selected with the `service` query parameter and counts down to the next check. The styleguide has no selected services, so the empty state is shown.',
  status: 'stable',
  canvasLayout: 'stretch',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rxap-status-check',
    imports: [RouterLink, NgClass],
    templateUrl: './status-check.component.html',
    styleUrls: ['./status-check.component.scss']
})
export class StatusCheckComponent {
  private readonly route = inject(ActivatedRoute);


  services: Signal<Array<ServiceStatus>>;

  status: Signal<ApiStatus>;

  url: Signal<string | null>;

  showRedirectWarning = signal(false);

  /**
   * indicates if the status check is ok and all services are up
   */
  statusIsOk: Signal<boolean>;
  statusIsError: Signal<boolean>;

  countdown = signal(inject(STATUS_CHECK_INTERVAL));
  private readonly statusCheckInterval = inject(STATUS_CHECK_INTERVAL);

  statusIsFatal: Signal<boolean>;

  statusIsUnavailable: Signal<boolean>;
  statusIsAvailable: Signal<boolean>;
  statusIsEmpty: Signal<boolean>;


  private readonly retry$ = new Subject<void>();

  private readonly statusCheckService = inject(StatusCheckService);
  constructor() {
    this.url = toSignal(
      this.route.queryParamMap.pipe(
        map(map => map.get('url')),
      ),
      { initialValue: null },
    );

    const status$ = this.route.queryParamMap.pipe(
      map(map => map.getAll('service')),
      switchMap(services => this.statusCheckService.getStatus(services)),
      debounceTime(100),
    );
    const manualRetry$ = this.retry$.pipe(switchMap(() => status$));
    this.status = toSignal(merge(status$, manualRetry$), { initialValue: { status: 'initial' } });
    this.services = computed(() => {
      const status = this.status();
      return [
        ...Object.entries(status.info ?? {})
                 .map(([ name, status ]) => ({
                   name,
                   status: status.status,
                   message: status['message'],
                 })),
        ...Object.entries(status.error ?? {})
                 .map(([ name, status ]) => ({
                   name,
                   status: status.status,
                   message: status['message'],
                 })),
      ].sort((a, b) => a.name.localeCompare(b.name));
    });
    this.statusIsOk = computed(() => this.status().status === 'ok');
    this.statusIsError = computed(() => this.status().status === 'error');
    this.statusIsEmpty = computed(() => this.status().status === 'empty');
    this.statusIsFatal = computed(() => this.status().status === 'fatal');
    this.statusIsAvailable =
      computed(() => [ 'ok', 'error', 'loading' ].includes(this.status().status ?? 'unavailable'));
    this.statusIsUnavailable = computed(() => !this.statusIsAvailable() &&
      ![ 'empty', 'fatal' ].includes(this.status().status ?? 'unavailable'));

    // restart the countdown every statusCheckInterval seconds and trigger a retry when it reaches zero
    interval(1000).pipe(takeUntilDestroyed()).subscribe(tick => {
      const val = tick % this.statusCheckInterval;
      this.countdown.set(this.statusCheckInterval - val);
      if (val === this.statusCheckInterval - 1) {
        this.retry$.next();
      }
    });
  }

  onCancel() {
    this.showRedirectWarning.set(false);
  }

  openWarningDialog() {
    this.showRedirectWarning.set(true);
  }

  trackBy(index: number, item: ServiceStatus) {
    return item.name;
  }

}
