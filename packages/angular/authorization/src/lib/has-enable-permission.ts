import {
  ChangeDetectorRef,
  Directive,
  inject,
  input,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
} from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  switchMap,
  tap,
} from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

/**
 * Base class for all directives that enable/disable a host component based on a permission.
 * Declares the shared `rxapHasEnablePermission` input. Subclasses only add a selector and
 * implement setDisabled.
 */
@Directive()
export abstract class HasEnablePermission {
  public readonly identifier = input.required<string>({ alias: 'rxapHasEnablePermission' });

  protected readonly cdr = inject(ChangeDetectorRef);
  private readonly authorization = inject(AuthorizationService);
  private readonly scope = inject(RXAP_AUTHORIZATION_SCOPE, { optional: true }) ?? null;
  private readonly valueAccessor = inject(NG_VALUE_ACCESSOR, { optional: true }) as ControlValueAccessor[] | null;

  constructor() {
    toObservable(this.identifier).pipe(
      switchMap(identifier => this.authorization.hasPermission$(identifier, this.scope)),
      tap((hasPermission) => {
        this.setDisabled(!hasPermission);
        this.valueAccessor?.forEach((value) => value.setDisabledState?.(!hasPermission));
        this.cdr.markForCheck();
      }),
      takeUntilDestroyed(),
    ).subscribe();
  }

  public abstract setDisabled(disabled: boolean): void;
}
