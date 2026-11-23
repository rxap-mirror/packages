import { Directive, inject } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { HasEnablePermission } from './has-enable-permission';
import { Showcase } from '@ng-prism/core';

@Showcase<MatInputHasEnablePermissionDirective>({
  title: 'Mat Input Has Enable Permission',
  category: 'Authorization',
  description: 'Disables a Material input if the user does not have the permission. The permission `prism.granted` is granted in the styleguide, `prism.denied` is missing.',
  status: 'stable',
  imports: [
    { name: 'MatFormField', from: '@angular/material/form-field' },
    { name: 'MatLabel', from: '@angular/material/form-field' },
    { name: 'MatInput', from: '@angular/material/input' },
  ],
  variants: [
    { name: 'Permitted', description: 'The user has the permission, the input is enabled.', host: { template: '<mat-form-field><mat-label>Name</mat-label><input matInput rxapHasEnablePermission="prism.granted"></mat-form-field>' } },
    { name: 'Denied', description: 'The permission is missing, the input is disabled.', host: { template: '<mat-form-field><mat-label>Name</mat-label><input matInput rxapHasEnablePermission="prism.denied"></mat-form-field>' } },
  ],
})
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
