import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { HasEnablePermission } from './has-enable-permission';

@Directive({
  selector: '[formControl][rxapHasEnablePermission],[formControlName][rxapHasEnablePermission]',
  standalone: true,
})
export class FormControlHasEnablePermissionDirective extends HasEnablePermission {
  private readonly ngControl = inject<NgControl>(NgControl);

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
