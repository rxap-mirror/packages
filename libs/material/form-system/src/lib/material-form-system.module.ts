import { NgModule } from '@angular/core';
import { ControlErrorDirectiveModule } from './control-error.directive';
import { ControlErrorsDirectiveModule } from './control-errors.directive';

@NgModule({
  exports: [
    ControlErrorDirectiveModule,
    ControlErrorsDirectiveModule
  ]
})
export class MaterialFormSystemModule {}
