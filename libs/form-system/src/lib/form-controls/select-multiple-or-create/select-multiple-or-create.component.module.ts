import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectMultipleOrCreateComponent } from './select-multiple-or-create.component';
import { MatTabsModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { RxapFormCardComponentModule } from '../../form-containers/form-card/form-card.component.module';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { RxapSelectMultipleListControlComponentModule } from '../select-multiple-list-control/select-multiple-list-control.component.module';


@NgModule({
  declarations:    [ SelectMultipleOrCreateComponent ],
  imports:         [
    CommonModule,
    RxapFormCardComponentModule,
    MatTabsModule,
    TranslateModule,
    RxapComponentSystemModule.register([ SelectMultipleOrCreateComponent ]),
    RxapSelectMultipleListControlComponentModule
  ],
  exports:         [ SelectMultipleOrCreateComponent ],
  entryComponents: [ SelectMultipleOrCreateComponent ]
})
export class RxapSelectMultipleOrCreateComponentModule {}
