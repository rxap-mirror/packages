import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapDateControlComponent } from './date-control.component';
import {
  MatDatepickerModule,
  MatInputModule,
  MatNativeDateModule
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { RxapInputControlDirectiveModule } from '../input-control/input-control.directive.module';
import { FormsModule } from '@angular/forms';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';
import { RxapStandaloneDateControlDirectiveModule } from './standalone-date-control.directive.module';


@NgModule({
  declarations:    [ RxapDateControlComponent ],
  imports:         [
    MatDatepickerModule,
    MatInputModule,
    TranslateModule,
    RxapInputControlDirectiveModule,
    FormsModule,
    FormFieldControlModule,
    CommonModule,
    MatNativeDateModule
  ],
  exports:         [ RxapDateControlComponent ],
  entryComponents: [ RxapDateControlComponent ]
})
export class RxapDateControlComponentModule {

  public static standalone(): ModuleWithProviders {
    return {
      ngModule:  DateControlComponentModuleStandalone,
      providers: []
    };
  }

}

@NgModule({
  exports: [
    RxapDateControlComponentModule,
    RxapStandaloneDateControlDirectiveModule
  ]
})
export class DateControlComponentModuleStandalone {}
