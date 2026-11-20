import { Directive, inject } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { HasEnablePermission } from './has-enable-permission';

@Directive({
  selector: '[matInput][rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatInputHasEnablePermissionDirective extends HasEnablePermission {
  private readonly matInput = inject<MatInput>(MatInput);

  public setDisabled(disabled: boolean) {
    this.matInput.disabled = disabled;
  }
}
