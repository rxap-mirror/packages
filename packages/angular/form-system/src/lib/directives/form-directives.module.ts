import { NgModule } from '@angular/core';
import { InputSelectOptionsDirective } from './input-select-options.directive';
import { ControlHideShowDirective } from './control-hide-show.directive';

@NgModule({
  exports: [
    InputSelectOptionsDirective,
    ControlHideShowDirective,
  ],
  imports: [
    InputSelectOptionsDirective,
    ControlHideShowDirective,
  ],
})
export class FormSystemDirectivesModule {}
