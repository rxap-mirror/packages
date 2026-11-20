import {
  Directive,
  inject,
} from '@angular/core';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { HasEnablePermission } from './has-enable-permission';

interface CanDisable {
  disabled: boolean;
}

@Directive({
  selector: 'button[rxapHasEnablePermission],[mat-button][rxapHasEnablePermission],[mat-raised-button][rxapHasEnablePermission],[mat-stroked-button][rxapHasEnablePermission],[mat-flat-button][rxapHasEnablePermission],[mat-icon-button][rxapHasEnablePermission],[mat-fab][rxapHasEnablePermission],[mat-mini-fab][rxapHasEnablePermission]',
  standalone: true,
})
export class MatButtonHasEnablePermissionDirective extends HasEnablePermission {
  private readonly button: CanDisable = (
    inject(MatButton, { optional: true }) ??
    inject(MatIconButton, { optional: true }) ??
    inject(MatMiniFabButton, { optional: true }) ??
    inject(MatFabButton, { optional: true })
  ) as CanDisable;

  constructor() {
    super();
    if (!this.button) {
      throw new Error('Could not inject the mat button instance!');
    }
  }

  public setDisabled(disabled: boolean): void {
    this.button.disabled = disabled;
  }
}
