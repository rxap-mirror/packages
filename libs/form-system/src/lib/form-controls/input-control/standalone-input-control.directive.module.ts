import { NgModule } from '@angular/core';
import { StandaloneInputControlDirective } from './standalone-input-control.directive';


@NgModule({
  declarations: [ StandaloneInputControlDirective ],
  exports:      [ StandaloneInputControlDirective ]
})
export class RxapStandaloneInputControlDirectiveModule {}
