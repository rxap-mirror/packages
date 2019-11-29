import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebixDataTableComponent } from './webix-data-table.component';


@NgModule({
  declarations:    [ WebixDataTableComponent ],
  imports:         [
    CommonModule
  ],
  exports:         [ WebixDataTableComponent ],
  entryComponents: [ WebixDataTableComponent ]
})
export class WebixDataTableModule {}
