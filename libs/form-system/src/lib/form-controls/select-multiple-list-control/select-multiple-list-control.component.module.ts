import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapSelectMultipleListControlComponent } from './select-multiple-list-control.component';
import {
  MatListModule,
  MatCardModule,
  MatFormFieldModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PaginatorComponentModule } from '../../utilities/paginator/paginator.component.module';
import { IconComponentModule } from '../../utilities/icon/icon.component.module';
import { TextFilterComponentModule } from '../../utilities/text-filter/text-filter.component.module';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { RxapIconButtonComponentModule } from '../../utilities/icon-button/icon-button-component.module';
import { TranslateModule } from '@ngx-translate/core';
import { StandaloneSelectMultipleListControlDirectiveModule } from './standalone-select-multiple-list-control.directive.module';


@NgModule({
  declarations:    [ RxapSelectMultipleListControlComponent ],
  imports:         [
    CommonModule,
    MatListModule,
    FlexLayoutModule,
    PaginatorComponentModule,
    IconComponentModule,
    RxapComponentSystemModule.register([ RxapSelectMultipleListControlComponent ]),
    TextFilterComponentModule,
    RxapIconButtonComponentModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule
  ],
  entryComponents: [ RxapSelectMultipleListControlComponent ],
  exports:         [ RxapSelectMultipleListControlComponent ]
})
export class RxapSelectMultipleListControlComponentModule {

  public static standalone(): ModuleWithProviders {
    return {
      ngModule:  SelectMultipleListControlComponentModuleStandalone,
      providers: []
    };
  }

}

@NgModule({
  exports: [
    RxapSelectMultipleListControlComponentModule,
    StandaloneSelectMultipleListControlDirectiveModule
  ]
})
export class SelectMultipleListControlComponentModuleStandalone {}
