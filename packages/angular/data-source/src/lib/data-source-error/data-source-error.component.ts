import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Environment,
  IsNotReleaseVersion,
  RXAP_ENVIRONMENT,
} from '@rxap/environment';
import { Observable } from 'rxjs';
import { Showcase } from '@ng-prism/core';

export interface DataSourceLikeForErrorHandling {
  refresh?: () => void;
  retry?: () => void;
  reset?: () => void;
  loading?: Observable<boolean> | boolean;
  loading$?: Observable<boolean>;
  error$?: Observable<unknown>;
  error?: Observable<unknown> | unknown | null;
}

@Showcase<DataSourceErrorComponent>({
  title: 'Data Source Error',
  category: 'Data Source',
  description: 'Error state of a data source. The retry and reset actions are functions and can not be set from a showcase variant, so only the buttonless state is shown. Provide the `RXAP_ENVIRONMENT` to show the error message in non release versions.',
  status: 'stable',
  variants: [
    { name: 'Default', inputs: { loading: false, error: { message: 'The server is not reachable' } } },
  ],
})
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
export class DataSourceErrorComponent {
  private readonly environment = inject<Environment>(RXAP_ENVIRONMENT);

  public readonly error = input<unknown | null | Observable<unknown>>();

  public readonly refresh = input<() => void>();

  public readonly retry = input<() => void>();

  public readonly reset = input<() => void>();

  public readonly loading = input<Observable<boolean> | boolean>();

  /**
   * Fallback source for refresh, retry, reset, loading and error. The explicit inputs take precedence.
   */
  public readonly dataSourceLike = input<DataSourceLikeForErrorHandling>();

  protected readonly effectiveRefresh = computed(() => this.refresh() ?? this.dataSourceLike()?.refresh);
  protected readonly effectiveRetry = computed(() => this.retry() ?? this.dataSourceLike()?.retry);
  protected readonly effectiveReset = computed(() => this.reset() ?? this.dataSourceLike()?.reset);
  protected readonly effectiveLoading = computed(() => {
    const dataSourceLike = this.dataSourceLike();
    return this.loading() ?? dataSourceLike?.loading ?? dataSourceLike?.loading$;
  });
  protected readonly effectiveError = computed(() => {
    const dataSourceLike = this.dataSourceLike();
    return this.error() ?? dataSourceLike?.error ?? dataSourceLike?.error$;
  });

  public readonly isNotRelease = IsNotReleaseVersion(this.environment);

  public readonly errorMessage = signal('Unknown Error');

  public readonly retryInProgress = signal(false);
  public readonly resetInProgress = signal(false);

  constructor() {
    // a new error value ends any running retry or reset
    effect(() => {
      this.effectiveError();
      untracked(() => this.clearProgress());
    });

    // a plain boolean loading flag that turned false ends any running retry or reset
    effect(() => {
      if (this.effectiveLoading() === false) {
        untracked(() => this.clearProgress());
      }
    });

    effect((onCleanup) => {
      const loading = this.effectiveLoading();
      if (loading instanceof Observable) {
        const subscription = loading.subscribe((value) => {
          if (!value) {
            this.clearProgress();
          }
        });
        onCleanup(() => subscription.unsubscribe());
      }
    });

    effect((onCleanup) => {
      const error = this.effectiveError();
      if (error instanceof Observable) {
        const subscription = error.subscribe((value: any) => {
          if (value) {
            this.errorMessage.set(value.message);
          }
        });
        onCleanup(() => subscription.unsubscribe());
      }
    });
  }

  private clearProgress() {
    this.retryInProgress.set(false);
    this.resetInProgress.set(false);
  }

  triggerRetry() {
    const retry = this.effectiveRetry();
    const refresh = this.effectiveRefresh();
    if (retry) {
      this.retryInProgress.set(true);
      retry();
    } else if (refresh) {
      this.retryInProgress.set(true);
      refresh();
    }
  }

  triggerReset() {
    const reset = this.effectiveReset();
    if (reset) {
      this.resetInProgress.set(true);
      reset();
    }
  }

}
