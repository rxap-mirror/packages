import { NgModule } from '@angular/core';
import { StandaloneControlDirective } from './standalone-control.directive';

@NgModule({
  declarations: [ StandaloneControlDirective ],
  exports:      [ StandaloneControlDirective ]
})
export class RxapStandaloneControlDirectiveModule {}
