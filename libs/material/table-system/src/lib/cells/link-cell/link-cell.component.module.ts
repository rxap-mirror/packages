import { NgModule } from '@angular/core';
import { LinkCellComponent } from './link-cell.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [LinkCellComponent],
  imports: [
    MatTooltipModule,
    MatIconModule,
    FlexLayoutModule,
    CommonModule
  ],
  exports: [LinkCellComponent]
})
export class LinkCellComponentModule { }
