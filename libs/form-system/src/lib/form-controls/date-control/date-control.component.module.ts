import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapDateControlComponent } from './date-control.component';
import {
  MatDatepickerModule,
  MatInputModule
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { RxapInputControlDirectiveModule } from '../input-control/input-control.directive.module';
import { FormsModule } from '@angular/forms';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';


@NgModule({
  declarations:    [ RxapDateControlComponent ],
  imports:         [
    MatDatepickerModule,
    MatInputModule,
    TranslateModule,
    RxapInputControlDirectiveModule,
    FormsModule,
    FormFieldControlModule,
    CommonModule
  ],
  exports:         [ RxapDateControlComponent ],
  entryComponents: [ RxapDateControlComponent ]
})
export class RxapDateControlComponentModule {}
