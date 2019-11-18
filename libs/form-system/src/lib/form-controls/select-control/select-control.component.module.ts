import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapSelectControlComponent } from './select-control.component';
import {
  MatSelectModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { FormFieldControlModule } from '../form-field-control/form-field-control.module';
import { TranslateModule } from '@ngx-translate/core';
import { RxapStandaloneSelectControlDirectiveModule } from './standalone-select-control.directive.module';


@NgModule({
  declarations:    [ RxapSelectControlComponent ],
  imports:         [
    CommonModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
    RxapComponentSystemModule.register([ RxapSelectControlComponent ]),
    MatButtonModule,
    FormFieldControlModule,
    TranslateModule
  ],
  exports:         [ RxapSelectControlComponent ],
  entryComponents: [ RxapSelectControlComponent ]
})
export class RxapSelectControlComponentModule {

  public static standalone(): ModuleWithProviders {
    return {
      ngModule:  SelectControlComponentModuleStandalone,
      providers: []
    };
  }

}

@NgModule({
  exports: [
    RxapSelectControlComponentModule,
    RxapStandaloneSelectControlDirectiveModule
  ]
})
export class SelectControlComponentModuleStandalone {}
