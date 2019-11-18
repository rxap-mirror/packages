import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapTextareaControlComponent } from './textarea-control.component';
import { MatInputModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { RxapTextareaControlDirectiveModule } from './textarea-control.directive.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations:    [ RxapTextareaControlComponent ],
  imports:         [
    MatInputModule,
    RxapTextareaControlDirectiveModule,
    FormsModule,
    FormFieldControlModule,
    CommonModule,
    RxapComponentSystemModule.register([ RxapTextareaControlComponent ]),
    TranslateModule
  ],
  exports:         [ RxapTextareaControlComponent ],
  entryComponents: [ RxapTextareaControlComponent ]
})
export class RxapTextareaControlComponentModule {}
