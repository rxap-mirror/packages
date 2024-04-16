import {
  JsonPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
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
  styleUrls: [ './data-source-error.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    NgIf,
    MatProgressSpinnerModule,
    JsonPipe,
  ],
})
export class DataSourceErrorComponent implements OnChanges, OnInit, OnDestroy {

  @Input()
  public error?: unknown | null | Observable<unknown>;

  @Input()
  public refresh?: () => void;

  @Input()
  public retry?: () => void;

  @Input()
  public reset?: () => void;

  @Input()
  public set dataSourceLike(value: DataSourceLikeForErrorHandling) {
    this.refresh ??= value.refresh;
    this.retry ??= value.retry;
    this.reset ??= value.reset;
    this.loading ??= value.loading ?? value.loading$;
    this.error ??= value.error ?? value.error$;
  }

  @Input()
  public loading?: Observable<boolean> | boolean;

  public isNotRelease = false;

  public errorMessage = signal('Unknown Error');

  public retryInProgress = signal(false);
  public resetInProgress = signal(false);

  private _subscription?: Subscription;

  constructor(
    @Inject(RXAP_ENVIRONMENT)
    private readonly environment: Environment,
  ) {
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
    if (this.loading instanceof Observable) {
      this._subscription.add(this.loading.subscribe((loading) => {
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
    if (this.error instanceof Observable) {
      this._subscription.add(this.error.subscribe((error) => {
        if (error) {
          this.errorMessage.set(error.message);
        }
      }));
    }
  }

  triggerRetry() {
    if (this.retry) {
      this.retryInProgress.set(true);
      this.retry();
    } else if (this.refresh) {
      this.retryInProgress.set(true);
      this.refresh();
    }
  }

  triggerReset() {
    if (this.reset) {
      this.resetInProgress.set(true);
      this.reset();
    }
  }

}
