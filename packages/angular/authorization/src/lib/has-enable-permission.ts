import {
  ChangeDetectorRef,
  Inject,
  Injectable,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Injectable()
export abstract class HasEnablePermission implements OnInit, OnDestroy {
  public identifier!: string;

  private _subscription?: Subscription;

  constructor(
    @Inject(AuthorizationService)
    private readonly authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
    private readonly scope: string | null = null,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
    private readonly valueAccessor: ControlValueAccessor[] | null = null,
  ) {
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  public ngOnInit() {
    this._subscription = this
      .authorization
      .hasPermission$(this.identifier, this.scope || null)
      .pipe(
        tap((hasPermission) => {
          this.setDisabled(!hasPermission);
          if (this.valueAccessor) {
            this.valueAccessor.forEach((value) => {
              if (value.setDisabledState) {
                value.setDisabledState(!hasPermission);
              }
            });
          }
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public abstract setDisabled(disabled: boolean): void;
}
