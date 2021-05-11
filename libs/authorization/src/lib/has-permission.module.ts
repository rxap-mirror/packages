import {NgModule} from '@angular/core';
import {
  MatInputHasEnablePermissionDirective,
  MatSelectHasEnablePermissionDirective,
  FormControlHasEnablePermissionDirective,
  MatSlideToggleHasEnablePermissionDirective,
  MatButtonHasEnablePermissionDirective,
  MatCheckboxHasEnablePermissionDirective
} from './has-enable-permission.directive';
import { HasWritePermissionDirective } from './has-write-permission.directive';
import { IfHasPermissionDirective } from './if-has-permission.directive';

@NgModule({
  declarations: [
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
    HasWritePermissionDirective
  ]
})
export class HasPermissionModule {
}
