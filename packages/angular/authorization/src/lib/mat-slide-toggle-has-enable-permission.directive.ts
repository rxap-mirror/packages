import { Directive, inject } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { HasEnablePermission } from './has-enable-permission';

@Directive({
  selector: 'mat-slide-toggle[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatSlideToggleHasEnablePermissionDirective extends HasEnablePermission {
  private readonly matSlideToggle = inject<MatSlideToggle>(MatSlideToggle);

  public setDisabled(disabled: boolean) {
    this.matSlideToggle.disabled = disabled;
  }
}
