import { NgModule } from '@angular/core';
import { CheckboxCellComponentModule } from './checkbox-cell/checkbox-cell.component.module';
import { CheckboxHeaderCellComponentModule } from './checkbox-header-cell/checkbox-header-cell.component.module';
import { SelectedRowsDirective } from './selected-rows.directive';


@NgModule({
  exports:      [
    CheckboxCellComponentModule,
    CheckboxHeaderCellComponentModule,
    SelectedRowsDirective
  ],
  declarations: [ SelectedRowsDirective ]
})
export class SelectRowModule {}
