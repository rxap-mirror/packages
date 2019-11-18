import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapSelectOrCreateComponent } from './select-or-create.component';
import { MatTabsModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { RxapSelectListControlComponentModule } from '../select-list-control/select-list-control.component.module';
import { RxapFormCardComponentModule } from '../../form-containers/form-card/form-card.component.module';
import { RxapComponentSystemModule } from '@rxap/component-system';


@NgModule({
  declarations:    [ RxapSelectOrCreateComponent ],
  imports:         [
    MatTabsModule,
    TranslateModule,
    RxapSelectListControlComponentModule,
    RxapFormCardComponentModule,
    CommonModule,
    RxapComponentSystemModule.register([ RxapSelectOrCreateComponent ])
  ],
  exports:         [ RxapSelectOrCreateComponent ],
  entryComponents: [ RxapSelectOrCreateComponent ]
})
export class RxapSelectOrCreateComponentModule {}
