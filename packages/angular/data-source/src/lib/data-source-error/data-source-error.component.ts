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
import { FlexModule } from '@angular/flex-layout/flex';
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

@Component({
  selector: 'rxap-data-source-error',
  templateUrl: './data-source-error.component.html',
  styleUrls: [ './data-source-error.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
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
  public loading?: Observable<boolean> | boolean;

  public isNotRelease = false;

  public errorMessage = signal('Unknown Error');

  public retryInProgress = signal(false);

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
    }
    if (changes['loading']) {
      if (!changes['loading'].currentValue && typeof changes['loading'].currentValue === 'boolean') {
        this.retryInProgress.set(false);
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
        if (!loading && this.retryInProgress()) {
          this.retryInProgress.set(false);
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

  retry() {
    if (this.refresh) {
      this.refresh();
    }
    this.retryInProgress.set(true);
  }

}
