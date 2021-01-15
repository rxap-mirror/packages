import { NgModule } from '@angular/core';
import { RowControlsCellComponentModule } from './row-controls-cell/row-controls-cell.component.module';
import { RowControlsHeaderCellComponentModule } from './row-controls-header-cell/row-controls-header-cell.component.module';


@NgModule({
  exports: [
    RowControlsCellComponentModule,
    RowControlsHeaderCellComponentModule
  ]
})
export class TableRowControlsModule {
}
