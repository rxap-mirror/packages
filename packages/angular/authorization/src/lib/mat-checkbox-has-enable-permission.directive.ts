import { Directive, inject } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { HasEnablePermission } from './has-enable-permission';
import { Showcase } from '@ng-prism/core';

@Showcase<MatCheckboxHasEnablePermissionDirective>({
  title: 'Mat Checkbox Has Enable Permission',
  category: 'Authorization',
  description: 'Disables a Material checkbox if the user does not have the permission. The permission `prism.granted` is granted in the styleguide, `prism.denied` is missing.',
  status: 'stable',
  imports: [ { name: 'MatCheckbox', from: '@angular/material/checkbox' } ],
  variants: [
    { name: 'Permitted', description: 'The user has the permission, the checkbox is enabled.', host: { template: '<mat-checkbox rxapHasEnablePermission="prism.granted">Accept the terms</mat-checkbox>' } },
    { name: 'Denied', description: 'The permission is missing, the checkbox is disabled.', host: { template: '<mat-checkbox rxapHasEnablePermission="prism.denied">Accept the terms</mat-checkbox>' } },
  ],
})
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
