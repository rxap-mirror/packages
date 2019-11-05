import { NgModule } from '@angular/core';
import { StandaloneNgModelControlDirective } from './standalone-ng-model-control.directive';


@NgModule({
  declarations: [ StandaloneNgModelControlDirective ],
  exports:      [ StandaloneNgModelControlDirective ]
})
export class StandaloneNgModelControlDirectiveModule {}
