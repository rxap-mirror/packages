import { NgModule } from '@angular/core';
import { OpenTableSelectWindowDirective } from './open-table-select-window.directive';

import { OpenTableSelectWindowMethod } from './open-table-select-window.method';
import { TableSelectControlDirective } from './table-select-control.directive';


@NgModule({
  imports: [
    OpenTableSelectWindowDirective,
    TableSelectControlDirective,
  ],
  exports: [
    OpenTableSelectWindowDirective,
    TableSelectControlDirective,
  ],
  providers: [
    OpenTableSelectWindowMethod,
  ],
})
export class TableSelectControlModule {
}
