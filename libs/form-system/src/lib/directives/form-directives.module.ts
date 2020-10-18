import { NgModule } from '@angular/core';
import { InputSelectOptionsDirective } from './input-select-options.directive';
import { ControlHideShowDirective } from './control-hide-show.directive';

@NgModule({
  declarations: [
    InputSelectOptionsDirective,
    ControlHideShowDirective,
  ],
  exports:      [
    InputSelectOptionsDirective,
    ControlHideShowDirective,
  ],
})
export class FormSystemDirectivesModule {}
