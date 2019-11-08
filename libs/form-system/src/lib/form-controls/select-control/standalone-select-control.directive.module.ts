import { NgModule } from '@angular/core';
import { StandaloneSelectControlDirective } from './standalone-select-control.directive';


@NgModule({
  declarations: [ StandaloneSelectControlDirective ],
  exports:      [ StandaloneSelectControlDirective ]
})
export class RxapStandaloneSelectControlDirectiveModule {}
