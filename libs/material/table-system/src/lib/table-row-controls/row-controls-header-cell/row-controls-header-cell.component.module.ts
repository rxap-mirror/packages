import { NgModule } from '@angular/core';
import { RowControlsHeaderCellComponent } from './row-controls-header-cell.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmComponentModule } from '@rxap/components';
import { CommonModule } from '@angular/common';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [RowControlsHeaderCellComponent],
  imports: [
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    ConfirmComponentModule,
    CommonModule,
    MatTooltipModule,
  ],
  exports: [RowControlsHeaderCellComponent],
})
export class RowControlsHeaderCellComponentModule {}
