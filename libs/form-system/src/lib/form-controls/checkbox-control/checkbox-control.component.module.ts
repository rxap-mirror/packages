import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { CheckboxControlComponent } from './checkbox-control.component';
import { MatCheckboxModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RxapStandaloneCheckboxControlDirectiveModule } from './standalone-checkbox-control.directive.module';
import { RxapComponentSystemModule } from '@rxap/component-system';


@NgModule({
  declarations:    [ CheckboxControlComponent ],
  imports:         [
    MatCheckboxModule,
    TranslateModule,
    RxapComponentSystemModule.register([ CheckboxControlComponent ]),
    FormsModule
  ],
  exports:         [ CheckboxControlComponent ],
  entryComponents: [ CheckboxControlComponent ]
})
export class RxapCheckboxControlComponentModule {

  public static standalone(): ModuleWithProviders {
    return {
      ngModule:  CheckboxControlComponentModuleStandalone,
      providers: []
    };
  }

}

@NgModule({
  exports: [
    RxapCheckboxControlComponentModule,
    RxapStandaloneCheckboxControlDirectiveModule
  ]
})
export class CheckboxControlComponentModuleStandalone {}
