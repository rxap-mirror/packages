import { NgModule } from '@angular/core';
import { ExpandControlsCellComponent } from './expand-controls-cell.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [ ExpandControlsCellComponent ],
  imports:      [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  exports:      [ ExpandControlsCellComponent ]
})
export class ExpandControlsCellComponentModule {}
