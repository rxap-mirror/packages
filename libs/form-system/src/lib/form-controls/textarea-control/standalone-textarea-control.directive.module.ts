import { NgModule } from '@angular/core';
import { StandaloneTextareaControlDirective } from './standalone-textarea-control.directive';


@NgModule({
  declarations: [ StandaloneTextareaControlDirective ],
  exports:      [ StandaloneTextareaControlDirective ]
})
export class StandaloneTextareaControlDirectiveModule {}
