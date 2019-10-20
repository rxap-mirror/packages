import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormCardComponent } from './form-card.component';
import {
  MatCardModule,
  MatButtonModule,
  MatToolbarModule
} from '@angular/material';
import { RxapFormViewComponentModule } from '../../form-view/rxap-form-view-component.module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [FormCardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    RxapFormViewComponentModule,
    FlexLayoutModule,
    MatButtonModule,
    MatToolbarModule
  ],
  exports: [FormCardComponent],
  entryComponents: [FormCardComponent]
})
export class RxapFormCardComponentModule {}
