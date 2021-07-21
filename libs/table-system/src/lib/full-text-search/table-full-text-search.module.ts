import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableFilterInputDirective } from './table-filter-input.directive';

@NgModule({
  exports:      [
    FormsModule,
    TableFilterInputDirective
  ],
  declarations: [
    TableFilterInputDirective
  ]
})
export class TableFullTextSearchModule {

}
