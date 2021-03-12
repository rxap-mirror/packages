import { NgModule } from '@angular/core';
import { BooleanCellComponent } from './boolean-cell.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [BooleanCellComponent],
  imports: [
    CommonModule,
    MatIconModule,
  ],
  exports: [BooleanCellComponent],
})
export class BooleanCellComponentModule {
}
