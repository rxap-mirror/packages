import {NgModule} from '@angular/core';


import {ExpandRowService} from './expand-row.service';
import {ExpandRowDirective} from './expand-row.directive';

/**
 * @deprecated use from @rxap/material-table-system
 */
@NgModule({
  imports: [ExpandRowDirective],
  exports: [
    ExpandRowDirective,
  ],
  providers: [ExpandRowService],
})
export class ExpandRowModule {
}
