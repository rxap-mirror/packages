import { NgModule } from '@angular/core';
import { DateCellComponent } from './date-cell.component';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [DateCellComponent],
  imports: [
    CommonModule,
  ],
  exports: [DateCellComponent],
})
export class DateCellComponentModule {
}
