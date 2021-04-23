import { NgModule } from '@angular/core';
import { IconCellComponent } from './icon-cell.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { IconDirectiveModule } from '@rxap/material-directives/icon';



@NgModule({
  declarations: [IconCellComponent],
  imports: [
    MatIconModule,
    CommonModule,
    IconDirectiveModule,
  ],
  exports: [IconCellComponent]
})
export class IconCellComponentModule { }
