import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateControlComponent } from './date-control.component';
import {
  MatDatepickerModule,
  MatInputModule
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { RxapInputControlDirectiveModule } from '../../..';
import { FormsModule } from '@angular/forms';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';


@NgModule({
  declarations:    [ DateControlComponent ],
  imports:         [
    MatDatepickerModule,
    MatInputModule,
    TranslateModule,
    RxapInputControlDirectiveModule,
    FormsModule,
    FormFieldControlModule,
    CommonModule
  ],
  exports:         [ DateControlComponent ],
  entryComponents: [ DateControlComponent ]
})
export class RxapDateControlComponentModule {}
