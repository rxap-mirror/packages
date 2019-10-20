import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectControlComponent } from './select-control.component';
import {
  MatSelectModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';


@NgModule({
  declarations:    [ SelectControlComponent ],
  imports:         [
    CommonModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
    RxapComponentSystemModule.register([ SelectControlComponent ]),
    MatButtonModule,
    FormFieldControlModule
  ],
  exports:         [ SelectControlComponent ],
  entryComponents: [ SelectControlComponent ]
})
export class RxapSelectControlModule {}
