import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Input,
  Optional,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { AuthorizationService } from './authorization.service';
import { HasEnablePermission } from './has-enable-permission';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: 'mat-checkbox[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatCheckboxHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(MatCheckbox)
    private readonly matCheckbox: MatCheckbox,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null,
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matCheckbox.disabled = disabled;
  }
}
