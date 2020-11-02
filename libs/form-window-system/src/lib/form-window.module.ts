import { NgModule } from '@angular/core';
import { OpenFormDirectiveModule } from '@rxap/form-window-system';
import { CloseWindowAfterSubmitDirectiveModule } from './close-window-after-submit.directive';

@NgModule({
  exports: [
    OpenFormDirectiveModule,
    CloseWindowAfterSubmitDirectiveModule
  ]
})
export class FormWindowModule {}
