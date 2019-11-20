import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRangeControlComponent } from './date-range-control.component';
import {
  FormFieldControlModule,
  RxapInputControlDirectiveModule
} from '@rxap/form-system';
import { MatInputModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { StandaloneDateRangeControlDirectiveModule } from './standalone-date-range-control.directive.module';
import { FormsModule } from '@angular/forms';
import { RxapComponentSystemModule } from '@rxap/component-system';

@NgModule({
  imports:         [
    CommonModule,
    FormFieldControlModule,
    MatInputModule,
    TranslateModule,
    RxapInputControlDirectiveModule,
    FormsModule,
    RxapComponentSystemModule.register([ DateRangeControlComponent ])
  ],
  declarations:    [ DateRangeControlComponent ],
  exports:         [ DateRangeControlComponent ],
  entryComponents: [ DateRangeControlComponent ]
})
export class RxapDateRangeControlComponentModule {

  public static standalone(): ModuleWithProviders {
    return {
      ngModule:  StandaloneDateRangeControlComponentModule,
      providers: []
    };
  }

}

@NgModule({
  exports: [
    RxapDateRangeControlComponentModule,
    StandaloneDateRangeControlDirectiveModule
  ]
})
export class StandaloneDateRangeControlComponentModule {}
