import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaControlComponent } from './textarea-control.component';
import { MatInputModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { RxapTextareaControlDirectiveModule } from './textarea-control.directive.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations:    [ TextareaControlComponent ],
  imports:         [
    MatInputModule,
    RxapTextareaControlDirectiveModule,
    FormsModule,
    FormFieldControlModule,
    CommonModule,
    RxapComponentSystemModule.register([ TextareaControlComponent ]),
    TranslateModule
  ],
  exports:         [ TextareaControlComponent ],
  entryComponents: [ TextareaControlComponent ]
})
export class RxapTextareaControlComponentModule {}
