import { NgModule } from '@angular/core';
import { DataGridReadonlyComponent } from './data-grid-readonly.component';
import { DataGridModule } from '../data-grid.component.module';
import { CommonModule } from '@angular/common';
import { GetFromObjectPipeModule } from '@rxap/pipes';

@NgModule({
  exports: [
    DataGridReadonlyComponent,
    DataGridModule
  ],
  imports: [
    GetFromObjectPipeModule,
    CommonModule
  ],
  declarations: [
    DataGridReadonlyComponent
  ]
})
export class DataGridReadonlyComponentModule {}
