import { ChangeDetectorRef, Directive, input, inject } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { AuthorizationService } from './authorization.service';
import { HasEnablePermission } from './has-enable-permission';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: 'mat-slide-toggle[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatSlideToggleHasEnablePermissionDirective extends HasEnablePermission {
  private readonly matSlideToggle = inject<MatSlideToggle>(MatSlideToggle);

  public override readonly identifier = input.required<string>({ alias: "rxapHasEnablePermission" });

  constructor() {
    const authorization = inject<AuthorizationService>(AuthorizationService);
    const cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
    const scope = inject(RXAP_AUTHORIZATION_SCOPE, { optional: true });
    const valueAccessor = inject(NG_VALUE_ACCESSOR, { optional: true }) ?? null;

    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matSlideToggle.disabled = disabled;
  }
}
