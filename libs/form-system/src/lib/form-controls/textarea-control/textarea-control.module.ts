import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaControlComponent } from './textarea-control.component';
import { MatInputModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';
import { RxapTextareaControlDirectiveModule } from './textarea-control-directive.module';
import { RxapComponentSystemModule } from '@rxap/component-system';

@NgModule({
  declarations:    [ TextareaControlComponent ],
  imports:         [
    MatInputModule,
    RxapTextareaControlDirectiveModule,
    FormsModule,
    FormFieldControlModule,
    CommonModule,
    RxapComponentSystemModule.register([ TextareaControlComponent ])
  ],
  exports:         [ TextareaControlComponent ],
  entryComponents: [ TextareaControlComponent ]
})
export class RxapTextareaControlModule {}
