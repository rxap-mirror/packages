import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatInputModule,
  MatIconModule
} from '@angular/material';
import { RxapInputControlComponent } from './input-control.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';
import { RxapInputControlDirectiveModule } from './input-control.directive.module';
import { RxapStandaloneInputControlDirectiveModule } from './standalone-input-control.directive.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations:    [ RxapInputControlComponent ],
  imports:         [
    MatInputModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    RxapComponentSystemModule.register([ RxapInputControlComponent ]),
    FormFieldControlModule,
    MatIconModule,
    RxapInputControlDirectiveModule,
    TranslateModule.forChild()
  ],
  exports:         [ RxapInputControlComponent ],
  entryComponents: [ RxapInputControlComponent ]
})
export class RxapInputControlComponentModule {

  public static standalone(): ModuleWithProviders {
    return {
      ngModule:  InputControlComponentModuleStandalone,
      providers: []
    };
  }

}

@NgModule({
  exports: [
    RxapInputControlComponentModule,
    RxapStandaloneInputControlDirectiveModule
  ]
})
export class InputControlComponentModuleStandalone {}
