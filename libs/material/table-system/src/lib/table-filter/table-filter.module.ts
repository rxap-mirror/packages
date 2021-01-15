import { NgModule } from '@angular/core';
import { ToFilterColumnNamesPipe } from './to-filter-column-names.pipe';
import { FilterHeaderRowDirective } from './filter-header-row.directive';


@NgModule({
  exports:      [
    ToFilterColumnNamesPipe,
    FilterHeaderRowDirective
  ],
  declarations: [
    ToFilterColumnNamesPipe,
    FilterHeaderRowDirective
  ]
})
export class TableFilterModule {
}
