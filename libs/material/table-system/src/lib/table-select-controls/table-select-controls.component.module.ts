import { NgModule } from '@angular/core';
import { TableSelectControlsComponent } from './table-select-controls.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [ TableSelectControlsComponent ],
  imports:      [
    MatButtonModule,
    FlexLayoutModule,
    CommonModule
  ],
  exports:      [ TableSelectControlsComponent ]
})
export class TableSelectControlsComponentModule {
}
