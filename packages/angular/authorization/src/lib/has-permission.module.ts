import { NgModule } from '@angular/core';
import {
  FormControlHasEnablePermissionDirective,
  MatButtonHasEnablePermissionDirective,
  MatCheckboxHasEnablePermissionDirective,
  MatInputHasEnablePermissionDirective,
  MatSelectHasEnablePermissionDirective,
  MatSlideToggleHasEnablePermissionDirective,
} from './has-enable-permission.directive';
import { HasWritePermissionDirective } from './has-write-permission.directive';
import { IfHasPermissionDirective } from './if-has-permission.directive';

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
