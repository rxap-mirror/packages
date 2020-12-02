import { NgModule } from '@angular/core';
import { DataGridRowDefDirective } from './data-grid-row-def.directive';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridEditCellDefDirective } from './data-grid-edit-cell-def.directive';

@NgModule({
  declarations: [
    DataGridRowDefDirective,
    DataGridHeaderCellDefDirective,
    DataGridCellDefDirective,
    DataGridEditCellDefDirective
  ],
  exports:      [
    DataGridRowDefDirective,
    DataGridHeaderCellDefDirective,
    DataGridCellDefDirective,
    DataGridEditCellDefDirective
  ]
})
export class DataGridModule {}
