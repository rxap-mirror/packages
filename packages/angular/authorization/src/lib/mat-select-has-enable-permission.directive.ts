import { Directive, inject } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { HasEnablePermission } from './has-enable-permission';
import { Showcase } from '@ng-prism/core';

@Showcase<MatSelectHasEnablePermissionDirective>({
  title: 'Mat Select Has Enable Permission',
  category: 'Authorization',
  description: 'Disables a Material select if the user does not have the permission. The permission `prism.granted` is granted in the styleguide, `prism.denied` is missing.',
  status: 'stable',
  imports: [
    { name: 'MatFormField', from: '@angular/material/form-field' },
    { name: 'MatLabel', from: '@angular/material/form-field' },
    { name: 'MatSelect', from: '@angular/material/select' },
    { name: 'MatOption', from: '@angular/material/select' },
  ],
  variants: [
    { name: 'Permitted', description: 'The user has the permission, the select is enabled.', host: { template: '<mat-form-field><mat-label>Role</mat-label><mat-select rxapHasEnablePermission="prism.granted"><mat-option value="admin">Admin</mat-option><mat-option value="user">User</mat-option></mat-select></mat-form-field>' } },
    { name: 'Denied', description: 'The permission is missing, the select is disabled.', host: { template: '<mat-form-field><mat-label>Role</mat-label><mat-select rxapHasEnablePermission="prism.denied"><mat-option value="admin">Admin</mat-option><mat-option value="user">User</mat-option></mat-select></mat-form-field>' } },
  ],
})
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
