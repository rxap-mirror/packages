import { NgModule } from '@angular/core';
import { RowControlsCellComponent } from './row-controls-cell.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmComponentModule } from '@rxap/components';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [ RowControlsCellComponent ],
  imports:      [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    ConfirmComponentModule,
    MatTooltipModule
  ],
  exports:      [ RowControlsCellComponent ]
})
export class RowControlsCellComponentModule {
}
