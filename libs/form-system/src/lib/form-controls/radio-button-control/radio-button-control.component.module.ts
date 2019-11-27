import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapRadioButtonControlComponent } from './radio-button-control.component';
import {
  MatRadioModule,
  MatFormFieldModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { TranslateModule } from '@ngx-translate/core';
import { StandaloneRadioButtonControlDirectiveModule } from './standalone-radio-button-control.directive.module';


@NgModule({
  declarations:    [ RxapRadioButtonControlComponent ],
  imports:         [
    CommonModule,
    MatRadioModule,
    FormsModule,
    MatFormFieldModule,
    FlexLayoutModule,
    RxapComponentSystemModule.register([ RxapRadioButtonControlComponent ]),
    TranslateModule
  ],
  exports:         [ RxapRadioButtonControlComponent ],
  entryComponents: [ RxapRadioButtonControlComponent ]
})
export class RxapRadioButtonControlComponentModule {

  public static standalone(): ModuleWithProviders {
    return {
      ngModule:  RadioButtonControlComponentModuleStandalone,
      providers: []
    };
  }

}

@NgModule({
  exports: [
    RxapRadioButtonControlComponentModule,
    StandaloneRadioButtonControlDirectiveModule
  ]
})
export class RadioButtonControlComponentModuleStandalone {}
