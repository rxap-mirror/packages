import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebixDataTableComponent } from './webix-data-table.component';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations:    [ WebixDataTableComponent ],
  imports:         [
    CommonModule,
    FlexLayoutModule
  ],
  exports:         [ WebixDataTableComponent ],
  entryComponents: [ WebixDataTableComponent ]
})
export class WebixDataTableModule {}
