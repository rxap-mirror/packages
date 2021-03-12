import { NgModule } from '@angular/core';
import { LinkCellComponent } from './link-cell.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [LinkCellComponent],
  imports: [
    MatTooltipModule,
    MatIconModule,
    FlexLayoutModule,
  ],
  exports: [LinkCellComponent]
})
export class LinkCellComponentModule { }
