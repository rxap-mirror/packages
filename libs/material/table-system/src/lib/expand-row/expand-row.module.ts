import { NgModule } from '@angular/core';


import { ExpandRowService } from './expand-row.service';
import { ExpandRowDirective } from './expand-row.directive';

@NgModule({
  imports:   [ ExpandRowDirective ],
  exports:   [
    ExpandRowDirective
  ],
  providers: [
    ExpandRowService
  ]
})
export class ExpandRowModule {}
