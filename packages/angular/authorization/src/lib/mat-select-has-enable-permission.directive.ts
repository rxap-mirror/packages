import { Directive, inject } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { HasEnablePermission } from './has-enable-permission';

@Directive({
  selector: 'mat-select[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatSelectHasEnablePermissionDirective extends HasEnablePermission {
  private readonly matSelect = inject<MatSelect>(MatSelect);

  public setDisabled(disabled: boolean) {
    this.matSelect.disabled = disabled;
  }
}
