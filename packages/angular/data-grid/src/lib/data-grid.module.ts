import { NgModule } from '@angular/core';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridEditCellDefDirective } from './data-grid-edit-cell-def.directive';
import { DataGridComponent } from './data-grid.component';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { DataGridRowDefDirective } from './data-grid-row-def.directive';

@NgModule({
  imports: [
    DataGridComponent,
    DataGridRowDefDirective,
    DataGridHeaderCellDefDirective,
    DataGridCellDefDirective,
    DataGridEditCellDefDirective,
  ],
  exports: [
    DataGridComponent,
    DataGridRowDefDirective,
    DataGridHeaderCellDefDirective,
    DataGridCellDefDirective,
    DataGridEditCellDefDirective,
  ],
})
export class DataGridModule {
}
