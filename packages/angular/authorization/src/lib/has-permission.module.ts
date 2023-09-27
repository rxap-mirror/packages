import { NgModule } from '@angular/core';
import { FormControlHasEnablePermissionDirective } from './form-control-has-enable-permission.directive';
import { HasWritePermissionDirective } from './has-write-permission.directive';
import { IfHasPermissionDirective } from './if-has-permission.directive';
import { MatButtonHasEnablePermissionDirective } from './mat-button-has-enable-permission.directive';
import { MatCheckboxHasEnablePermissionDirective } from './mat-checkbox-has-enable-permission.directive';
import { MatInputHasEnablePermissionDirective } from './mat-input-has-enable-permission.directive';
import { MatSelectHasEnablePermissionDirective } from './mat-select-has-enable-permission.directive';
import { MatSlideToggleHasEnablePermissionDirective } from './mat-slide-toggle-has-enable-permission.directive';

@NgModule({
  imports: [
    MatButtonHasEnablePermissionDirective,
    MatInputHasEnablePermissionDirective,
    MatSelectHasEnablePermissionDirective,
    MatCheckboxHasEnablePermissionDirective,
    MatSlideToggleHasEnablePermissionDirective,
    FormControlHasEnablePermissionDirective,
    IfHasPermissionDirective,
    HasWritePermissionDirective,
  ],
  exports: [
    MatButtonHasEnablePermissionDirective,
    MatInputHasEnablePermissionDirective,
    MatSelectHasEnablePermissionDirective,
    MatCheckboxHasEnablePermissionDirective,
    MatSlideToggleHasEnablePermissionDirective,
    FormControlHasEnablePermissionDirective,
    IfHasPermissionDirective,
    HasWritePermissionDirective,
  ],
})
export class HasPermissionModule {
}
