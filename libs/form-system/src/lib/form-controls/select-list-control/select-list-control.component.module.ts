import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectListControlComponent } from './select-list-control.component';
import {
  MatListModule,
  MatPaginatorModule,
  MatCardModule,
  MatFormFieldModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TextFilterComponentModule } from '../../utilities/text-filter/text-filter.component.module';
import { PaginatorComponentModule } from '../../utilities/paginator/paginator.component.module';
import { FormsModule } from '@angular/forms';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { IconComponentModule } from '../../utilities/icon/icon.component.module';
import { RxapIconButtonComponentModule } from '../../utilities/icon-button/icon-button-component.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations:    [ SelectListControlComponent ],
  imports:         [
    CommonModule,
    MatListModule,
    FlexLayoutModule,
    MatPaginatorModule,
    TextFilterComponentModule,
    RxapComponentSystemModule.register([ SelectListControlComponent ]),
    PaginatorComponentModule,
    FormsModule,
    IconComponentModule,
    RxapIconButtonComponentModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule
  ],
  exports:         [ SelectListControlComponent ],
  entryComponents: [ SelectListControlComponent ]
})
export class RxapSelectListControlComponentModule {}
