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
import { Showcase } from '@ng-prism/core';

interface CanDisable {
  disabled: boolean;
}

@Showcase<MatButtonHasEnablePermissionDirective>({
  title: 'Mat Button Has Enable Permission',
  category: 'Authorization',
  description: 'Disables a Material button if the user does not have the permission. The permission `prism.granted` is granted in the styleguide, `prism.denied` is missing.',
  status: 'stable',
  imports: [ { name: 'MatButton', from: '@angular/material/button' } ],
  variants: [
    { name: 'Permitted', description: 'The user has the permission, the button is enabled.', host: { template: '<button mat-flat-button rxapHasEnablePermission="prism.granted">Save</button>' } },
    { name: 'Denied', description: 'The permission is missing, the button is disabled.', host: { template: '<button mat-flat-button rxapHasEnablePermission="prism.denied">Save</button>' } },
    { name: 'Stroked button denied', host: { template: '<button mat-stroked-button rxapHasEnablePermission="prism.denied">Delete</button>' } },
  ],
})
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
