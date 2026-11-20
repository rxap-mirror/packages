import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges, input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Environment,
  IsNotReleaseVersion,
  RXAP_ENVIRONMENT,
} from '@rxap/environment';
import {
  Observable,
  Subscription,
} from 'rxjs';

export interface DataSourceLikeForErrorHandling {
  refresh?: () => void;
  retry?: () => void;
  reset?: () => void;
  loading?: Observable<boolean> | boolean;
  loading$?: Observable<boolean>;
  error$?: Observable<unknown>;
  error?: Observable<unknown> | unknown | null;
}

@Component({
    selector: 'rxap-data-source-error',
    templateUrl: './data-source-error.component.html',
    styleUrls: ['./data-source-error.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    JsonPipe
]
})
export class DataSourceErrorComponent implements OnChanges, OnInit, OnDestroy {
  private readonly environment = inject<Environment>(RXAP_ENVIRONMENT);


  public readonly error = input<unknown | null | Observable<unknown>>();

  public readonly refresh = input<() => void>();

  public readonly retry = input<() => void>();

  public readonly reset = input<() => void>();

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set dataSourceLike(value: DataSourceLikeForErrorHandling) {
    this.refresh() ??= value.refresh;
    this.retry() ??= value.retry;
    this.reset() ??= value.reset;
    this.loading() ??= value.loading ?? value.loading$;
    this.error() ??= value.error ?? value.error$;
  }

  public readonly loading = input<Observable<boolean> | boolean>();

  public isNotRelease = false;

  public errorMessage = signal('Unknown Error');

  public retryInProgress = signal(false);
  public resetInProgress = signal(false);

  private _subscription?: Subscription;

  constructor() {
    const environment = this.environment;

    this.isNotRelease = IsNotReleaseVersion(environment);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['error']) {
      this.retryInProgress.set(false);
      this.resetInProgress.set(false);
    }
    if (changes['loading']) {
      if (!changes['loading'].currentValue && typeof changes['loading'].currentValue === 'boolean') {
        this.retryInProgress.set(false);
        this.resetInProgress.set(false);
      }
    }
  }

  ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  ngOnInit() {
    this._subscription = new Subscription();
    const loadingValue = this.loading();
    if (loadingValue instanceof Observable) {
      this._subscription.add(loadingValue.subscribe((loading) => {
        if (!loading) {
          if (this.retryInProgress()) {
            this.retryInProgress.set(false);
          }
          if (this.resetInProgress()) {
            this.resetInProgress.set(false);
          }
        }
      }));
    }
    const errorValue = this.error();
    if (errorValue instanceof Observable) {
      this._subscription.add(errorValue.subscribe((error) => {
        if (error) {
          this.errorMessage.set(error.message);
        }
      }));
    }
  }

  triggerRetry() {
    const refresh = this.refresh();
    const retry = this.retry();
    if (retry) {
      this.retryInProgress.set(true);
      retry();
    } else if (refresh) {
      this.retryInProgress.set(true);
      refresh();
    }
  }

  triggerReset() {
    const reset = this.reset();
    if (reset) {
      this.resetInProgress.set(true);
      reset();
    }
  }

}
