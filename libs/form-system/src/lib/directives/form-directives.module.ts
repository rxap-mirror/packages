import { NgModule } from '@angular/core';
import { InputSelectOptionsDirectiveModule } from './input-select-options.directive';
import { ControlHideShowDirectiveModule } from './control-hide-show.directive';

@NgModule({
  exports: [
    InputSelectOptionsDirectiveModule,
    ControlHideShowDirectiveModule
  ]
})
export class FormSystemDirectivesModule {}
