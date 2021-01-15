import { NgModule } from '@angular/core';
import { RowControlsHeaderCellComponent } from './row-controls-header-cell.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmComponentModule } from '@rxap/components';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [ RowControlsHeaderCellComponent ],
  imports:      [
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    ConfirmComponentModule,
    CommonModule
  ],
  exports:      [ RowControlsHeaderCellComponent ]
})
export class RowControlsHeaderCellComponentModule {
}
