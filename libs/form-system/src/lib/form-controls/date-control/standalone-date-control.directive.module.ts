import { NgModule } from '@angular/core';
import { StandaloneDateControlDirective } from './standalone-date-control.directive';


@NgModule({
  declarations: [ StandaloneDateControlDirective ],
  exports:      [ StandaloneDateControlDirective ]
})
export class RxapStandaloneDateControlDirectiveModule {}
