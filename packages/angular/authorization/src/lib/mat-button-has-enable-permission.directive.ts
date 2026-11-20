import { ChangeDetectorRef, Directive, Injector, INJECTOR, OnInit, input, inject } from '@angular/core';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { AuthorizationService } from './authorization.service';
import { HasEnablePermission } from './has-enable-permission';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

interface CanDisable {
  disabled: boolean;
}

@Directive({
  selector: 'button[rxapHasEnablePermission],[mat-button][rxapHasEnablePermission],[mat-raised-button][rxapHasEnablePermission],[mat-stroked-button][rxapHasEnablePermission],[mat-flat-button][rxapHasEnablePermission],[mat-icon-button][rxapHasEnablePermission],[mat-fab][rxapHasEnablePermission],[mat-mini-fab][rxapHasEnablePermission]',
  standalone: true,
})
export class MatButtonHasEnablePermissionDirective extends HasEnablePermission implements OnInit {
  private readonly injector = inject<Injector>(INJECTOR);

  public override readonly identifier = input.required<string>({ alias: "rxapHasEnablePermission" });

  private _button!: CanDisable;

  constructor() {
    const authorization = inject<AuthorizationService>(AuthorizationService);
    const cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
    const scope = inject(RXAP_AUTHORIZATION_SCOPE, { optional: true });

    super(authorization, cdr, scope);
  }

  public setDisabled(disabled: boolean): void {
    this._button.disabled = disabled;
  }

  override ngOnInit() {
    this._button = this.injector.get<CanDisable>(
      MatButton,
      this.injector.get(MatIconButton, this.injector.get(MatMiniFabButton, this.injector.get(MatFabButton, null))),
    );
    if (!this._button) {
      throw new Error('Could not inject the mat button instance!');
    }
    // must be called after the button is injected
    // the setDisabled method is called in the super.ngOnInit method
    super.ngOnInit();
  }

}
