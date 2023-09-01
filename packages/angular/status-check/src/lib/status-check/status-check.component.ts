import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
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
import { map } from 'rxjs/operators';
import {
  ApiStatus,
  StatusCheckService,
} from '../status-check.service';

export const STATUS_CHECK_INTERVAL = isDevMode() ? 5 : 60;

@Component({
  selector: 'rxap-status-check',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './status-check.component.html',
  styleUrls: [ './status-check.component.scss' ],
})
export class StatusCheckComponent implements OnInit, OnDestroy {

  services: Signal<Array<{ name: string, status: string | undefined }>>;

  status: Signal<ApiStatus>;

  url: Signal<string | null>;

  showRedirectWarning = signal(false);

  /**
   * indicates if the status check is ok and all services are up
   */
  statusIsOk: Signal<boolean>;

  statusIsError: Signal<boolean>;

  countdown = signal(STATUS_CHECK_INTERVAL);

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
      log('send'),
      switchMap(services => this.statusCheckService.getStatus(services)),
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
                 })),
        ...Object.entries(status.error ?? {})
                 .map(([ name, status ]) => ({
                   name,
                   status: status.status,
                 })),
      ].sort((a, b) => a.name.localeCompare(b.name));
    });
    this.statusIsOk = computed(() => this.status().status === 'ok');
    this.statusIsError = computed(() => this.status().status === 'error');
    this.statusIsEmpty = computed(() => this.status().status === 'empty');
    this.statusIsFatal = computed(() => this.status().status === 'fatal');
    this.statusIsUnavailable = computed(() => this.status().status === 'unavailable');
    this.statusIsAvailable =
      computed(() => [ 'ok', 'error', 'loading' ].includes(this.status().status ?? 'unavailable'));
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
        take(STATUS_CHECK_INTERVAL),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: val => this.countdown.set(STATUS_CHECK_INTERVAL - val),
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          error: () => {},
          complete: () => {
            this.retry$.next();
            this.countdown.set(STATUS_CHECK_INTERVAL);
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
}
