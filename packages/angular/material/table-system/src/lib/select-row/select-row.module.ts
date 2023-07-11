import { NgModule } from '@angular/core';
import { CheckboxCellComponent } from './checkbox-cell/checkbox-cell.component';
import { CheckboxHeaderCellComponent } from './checkbox-header-cell/checkbox-header-cell.component';
import { SelectedRowsDirective } from './selected-rows.directive';


@NgModule({
  exports: [
    CheckboxCellComponent,
    CheckboxHeaderCellComponent,
    SelectedRowsDirective,
  ],
  imports: [
    SelectedRowsDirective,
    CheckboxCellComponent,
    CheckboxHeaderCellComponent,
  ],
})
export class SelectRowModule {}
