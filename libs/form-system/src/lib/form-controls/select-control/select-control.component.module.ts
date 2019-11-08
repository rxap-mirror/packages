import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
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
import { RxapStandaloneSelectControlDirectiveModule } from './standalone-select-control.directive.module';


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
