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
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations:    [ SelectControlComponent ],
  imports:         [
    CommonModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
    RxapComponentSystemModule.register([ SelectControlComponent ]),
    MatButtonModule,
    FormFieldControlModule,
    TranslateModule.forChild()
  ],
  exports:         [ SelectControlComponent ],
  entryComponents: [ SelectControlComponent ]
})
export class RxapSelectControlComponentModule {}
