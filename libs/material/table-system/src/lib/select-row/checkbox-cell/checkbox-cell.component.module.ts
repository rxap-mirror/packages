import { NgModule } from '@angular/core';
import { CheckboxCellComponent } from './checkbox-cell.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [ CheckboxCellComponent ],
  imports:      [
    MatCheckboxModule,
    CommonModule
  ],
  exports:      [ CheckboxCellComponent ]
})
export class CheckboxCellComponentModule {}
