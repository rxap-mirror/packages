import { NgModule } from '@angular/core';
import { OpenTableSelectWindowDirective } from './open-table-select-window.directive';

import { OpenTableSelectWindowMethod } from './open-table-select-window.method';
import { TableSelectControlDirective } from './table-select-control.directive';
import { TableSelectInputComponent } from './table-select-input/table-select-input.component';
import { TableSelectWindowComponent } from './table-select-window/table-select-window.component';


@NgModule({
  imports: [
    OpenTableSelectWindowDirective,
    TableSelectControlDirective,
    TableSelectInputComponent,
    TableSelectWindowComponent,
  ],
  exports: [
    OpenTableSelectWindowDirective,
    TableSelectControlDirective,
    TableSelectInputComponent,
    TableSelectWindowComponent,
  ],
  providers: [
    OpenTableSelectWindowMethod,
  ],
})
export class TableSelectControlModule {
}
