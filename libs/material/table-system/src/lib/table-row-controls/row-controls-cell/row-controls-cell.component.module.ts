import { NgModule } from '@angular/core';
import { RowControlsCellComponent } from './row-controls-cell.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmComponentModule } from '@rxap/components';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';


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
