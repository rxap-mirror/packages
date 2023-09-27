import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Injector,
  INJECTOR,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { CanDisable } from '@angular/material/core';
import { AuthorizationService } from './authorization.service';
import { HasEnablePermission } from './has-enable-permission';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: 'button[rxapHasEnablePermission],[mat-button][rxapHasEnablePermission],[mat-raised-button][rxapHasEnablePermission],[mat-stroked-button][rxapHasEnablePermission],[mat-flat-button][rxapHasEnablePermission],[mat-icon-button][rxapHasEnablePermission],[mat-fab][rxapHasEnablePermission],[mat-mini-fab][rxapHasEnablePermission]',
  standalone: true,
})
export class MatButtonHasEnablePermissionDirective extends HasEnablePermission implements OnInit {
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  private _button!: CanDisable;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
  ) {
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
