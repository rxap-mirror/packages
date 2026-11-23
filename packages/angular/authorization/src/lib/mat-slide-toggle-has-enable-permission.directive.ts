import { Directive, inject } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { HasEnablePermission } from './has-enable-permission';
import { Showcase } from '@ng-prism/core';

@Showcase<MatSlideToggleHasEnablePermissionDirective>({
  title: 'Mat Slide Toggle Has Enable Permission',
  category: 'Authorization',
  description: 'Disables a Material slide toggle if the user does not have the permission. The permission `prism.granted` is granted in the styleguide, `prism.denied` is missing.',
  status: 'stable',
  imports: [ { name: 'MatSlideToggle', from: '@angular/material/slide-toggle' } ],
  variants: [
    { name: 'Permitted', description: 'The user has the permission, the slide toggle is enabled.', host: { template: '<mat-slide-toggle rxapHasEnablePermission="prism.granted">Notifications</mat-slide-toggle>' } },
    { name: 'Denied', description: 'The permission is missing, the slide toggle is disabled.', host: { template: '<mat-slide-toggle rxapHasEnablePermission="prism.denied">Notifications</mat-slide-toggle>' } },
  ],
})
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
