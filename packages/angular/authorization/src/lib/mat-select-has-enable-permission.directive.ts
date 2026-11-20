import { ChangeDetectorRef, Directive, input, inject } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { AuthorizationService } from './authorization.service';
import { HasEnablePermission } from './has-enable-permission';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: 'mat-select[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatSelectHasEnablePermissionDirective extends HasEnablePermission {
  private readonly matSelect = inject<MatSelect>(MatSelect);

  public override readonly identifier = input.required<string>({ alias: "rxapHasEnablePermission" });

  constructor() {
    const authorization = inject<AuthorizationService>(AuthorizationService);
    const cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
    const scope = inject(RXAP_AUTHORIZATION_SCOPE, { optional: true });
    const valueAccessor = inject(NG_VALUE_ACCESSOR, { optional: true }) ?? null;

    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matSelect.disabled = disabled;
  }
}
