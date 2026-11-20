import { Directive, inject } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { HasEnablePermission } from './has-enable-permission';

@Directive({
  selector: 'mat-checkbox[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatCheckboxHasEnablePermissionDirective extends HasEnablePermission {
  private readonly matCheckbox = inject<MatCheckbox>(MatCheckbox);

  public setDisabled(disabled: boolean) {
    this.matCheckbox.disabled = disabled;
  }
}
