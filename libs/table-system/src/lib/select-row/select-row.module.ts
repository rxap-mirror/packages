import { NgModule } from '@angular/core';
import { SelectRowService } from './select-row.service';
import { CheckboxCellComponentModule } from './checkbox-cell/checkbox-cell.component.module';
import { CheckboxHeaderCellComponentModule } from './checkbox-header-cell/checkbox-header-cell.component.module';
import { AllRowsSelectedDirective } from './all-rows-selected.directive';


@NgModule({
  exports:   [
    CheckboxCellComponentModule,
    CheckboxHeaderCellComponentModule,
    AllRowsSelectedDirective,
  ],
  providers: [ SelectRowService ],
  declarations: [AllRowsSelectedDirective]
})
export class SelectRowModule {}
