import { NgModule } from '@angular/core';
import { StandaloneDateRangeControlDirective } from './standalone-date-range-control.directive';


@NgModule({
  declarations: [ StandaloneDateRangeControlDirective ],
  exports:      [ StandaloneDateRangeControlDirective ]
})
export class StandaloneDateRangeControlDirectiveModule {}
