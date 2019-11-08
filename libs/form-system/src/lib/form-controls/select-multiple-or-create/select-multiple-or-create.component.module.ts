import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectMultipleOrCreateComponent } from './select-multiple-or-create.component';
import { RxapSelectListControlComponentModule } from '../select-list-control/select-list-control.component.module';
import { MatTabsModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { RxapFormCardComponentModule } from '../../form-containers/form-card/form-card.component.module';
import { RxapComponentSystemModule } from '@rxap/component-system';


@NgModule({
  declarations:    [ SelectMultipleOrCreateComponent ],
  imports:         [
    CommonModule,
    RxapFormCardComponentModule,
    MatTabsModule,
    RxapSelectListControlComponentModule,
    TranslateModule.forChild(),
    RxapComponentSystemModule.register([ SelectMultipleOrCreateComponent ])
  ],
  exports:         [ SelectMultipleOrCreateComponent ],
  entryComponents: [ SelectMultipleOrCreateComponent ]
})
export class RxapSelectMultipleOrCreateComponentModule {}
