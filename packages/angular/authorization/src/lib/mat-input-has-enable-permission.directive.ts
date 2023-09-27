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
import { MatInput } from '@angular/material/input';
import { AuthorizationService } from './authorization.service';
import { HasEnablePermission } from './has-enable-permission';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: '[matInput][rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatInputHasEnablePermissionDirective extends HasEnablePermission {

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(MatInput)
    private readonly matInput: MatInput,
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
    this.matInput.disabled = disabled;
  }
}
