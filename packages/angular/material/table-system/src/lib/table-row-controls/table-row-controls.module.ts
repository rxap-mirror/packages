import { NgModule } from '@angular/core';
import { RowControlsCellComponent } from './row-controls-cell/row-controls-cell.component';
import { RowControlsHeaderCellComponent } from './row-controls-header-cell/row-controls-header-cell.component';


/**
 * @deprecated removed
 */
@NgModule({
  imports: [
    RowControlsCellComponent,
    RowControlsHeaderCellComponent,
  ],
  exports: [
    RowControlsCellComponent,
    RowControlsHeaderCellComponent,
  ],
})
export class TableRowControlsModule {
}
