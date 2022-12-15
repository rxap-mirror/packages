import { NgModule } from '@angular/core';
import { CheckboxHeaderCellComponent } from './checkbox-header-cell.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [CheckboxHeaderCellComponent],
  imports: [
    MatCheckboxModule,
    CommonModule
  ],
  exports: [CheckboxHeaderCellComponent]
})
export class CheckboxHeaderCellComponentModule { }
