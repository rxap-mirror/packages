import { NgModule } from '@angular/core';
import { RxapInputControlComponentModule } from './input-control/input-control.component.module';
import { RxapRadioButtonControlComponentModule } from './radio-button-control/radio-button-control.component.module';
import { RxapSelectControlComponentModule } from './select-control/select-control.component.module';
import { RxapSelectListControlComponentModule } from './select-list-control/select-list-control.component.module';
import { RxapSelectMultipleListControlComponentModule } from './select-multiple-list-control/select-multiple-list-control.component.module';
import { RxapSelectMultipleOrCreateComponentModule } from './select-multiple-or-create/select-multiple-or-create.component.module';
import { RxapSelectOrCreateComponentModule } from './select-or-create/select-or-create.component.module';
import { RxapTextareaControlComponentModule } from './textarea-control/textarea-control.component.module';
import { RxapCheckboxControlComponentModule } from './checkbox-control/checkbox-control.component.module';
import { RxapDateControlComponentModule } from './date-control/date-control.component.module';

@NgModule({
  exports: [
    RxapInputControlComponentModule,
    RxapRadioButtonControlComponentModule,
    RxapSelectControlComponentModule,
    RxapSelectListControlComponentModule,
    RxapSelectMultipleListControlComponentModule,
    RxapSelectMultipleOrCreateComponentModule,
    RxapSelectOrCreateComponentModule,
    RxapTextareaControlComponentModule,
    RxapCheckboxControlComponentModule,
    RxapDateControlComponentModule
  ]
})
export class RxapFormControlComponentModule {}
