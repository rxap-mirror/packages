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
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { AuthorizationService } from './authorization.service';
import { HasEnablePermission } from './has-enable-permission';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: 'mat-slide-toggle[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatSlideToggleHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(MatSlideToggle)
    private readonly matSlideToggle: MatSlideToggle,
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
    this.matSlideToggle.disabled = disabled;
  }
}
