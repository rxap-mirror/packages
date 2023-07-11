import { NgModule } from '@angular/core';
import { ControlErrorDirective } from './control-error.directive';
import { ControlErrorsDirective } from './control-errors.directive';
import { InputClearButtonDirective } from './input-clear-button.directive';
import { RequiredDirective } from './required.directive';
import { FormFieldHideShowDirective } from './form-field-hide-show.directive';

@NgModule({
  exports: [
    ControlErrorDirective,
    ControlErrorsDirective,
    InputClearButtonDirective,
    RequiredDirective,
    FormFieldHideShowDirective,
  ],
  imports: [
    ControlErrorDirective,
    ControlErrorsDirective,
    InputClearButtonDirective,
    RequiredDirective,
    FormFieldHideShowDirective,
  ],
})
export class MaterialFormSystemModule {}
