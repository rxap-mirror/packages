import { NgModule } from '@angular/core';
import { CheckboxCellComponent } from './checkbox-cell.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
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
