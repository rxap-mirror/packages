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
  NgControl,
} from '@angular/forms';
import { AuthorizationService } from './authorization.service';
import { HasEnablePermission } from './has-enable-permission';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: '[formControl][rxapHasEnablePermission],[formControlName][rxapHasEnablePermission]',
  standalone: true,
})
export class FormControlHasEnablePermissionDirective extends HasEnablePermission {

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null,
    @Inject(NgControl)
    private readonly ngControl: NgControl,
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    if (this.ngControl.control) {
      if (disabled) {
        this.ngControl.control.disable();
      } else {
        this.ngControl.control.enable();
      }
    }
  }
}
