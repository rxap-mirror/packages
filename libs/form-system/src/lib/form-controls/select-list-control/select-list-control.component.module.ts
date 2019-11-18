import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapSelectListControlComponent } from './select-list-control.component';
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
  declarations:    [ RxapSelectListControlComponent ],
  imports:         [
    CommonModule,
    MatListModule,
    FlexLayoutModule,
    MatPaginatorModule,
    TextFilterComponentModule,
    RxapComponentSystemModule.register([ RxapSelectListControlComponent ]),
    PaginatorComponentModule,
    FormsModule,
    IconComponentModule,
    RxapIconButtonComponentModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule
  ],
  exports:         [ RxapSelectListControlComponent ],
  entryComponents: [ RxapSelectListControlComponent ]
})
export class RxapSelectListControlComponentModule {}
