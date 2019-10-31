import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormInstancesComponent } from './form-instances.component';
import { FormInstanceComponent } from './form-instance/form-instance.component';
import {
  MatExpansionModule,
  MatButtonModule,
  MatTabsModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [ FormInstancesComponent, FormInstanceComponent ],
  imports:      [
    CommonModule,
    MatExpansionModule,
    FlexLayoutModule,
    MatButtonModule,
    MatTabsModule
  ],
  exports:      [ FormInstancesComponent ]
})
export class FormInstancesComponentModule {}
