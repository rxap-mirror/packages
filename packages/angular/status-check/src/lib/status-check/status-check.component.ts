import {
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
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
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
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
import { map } from 'rxjs/operators';
import {
  ApiStatus,
  StatusCheckService,
} from '../status-check.service';
import { STATUS_CHECK_INTERVAL } from '../tokens';

export interface ServiceStatus {
  name: string,
  status: string | undefined,
  message?: string
}

@Component({
  selector: 'rxap-status-check',
  standalone: true,
  imports: [ RouterLink, NgIf, NgClass, NgForOf ],
  templateUrl: './status-check.component.html',
  styleUrls: [ './status-check.component.scss' ],
})
export class StatusCheckComponent implements OnInit, OnDestroy {

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
        take(this.statusCheckInterval),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: val => this.countdown.set(this.statusCheckInterval - val),
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          error: () => {},
          complete: () => {
            this.retry$.next();
            this.countdown.set(this.statusCheckInterval);
            // Your API check logic here
            this.initiateCountdown();
          },
        },
      );
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
