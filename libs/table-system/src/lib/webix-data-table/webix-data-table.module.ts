import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebixDataTableComponent } from './webix-data-table.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapSelectControlComponentModule } from '@rxap/form-system';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations:    [ WebixDataTableComponent ],
  imports:         [
    CommonModule,
    FlexLayoutModule,
    RxapSelectControlComponentModule.standalone(),
    FormsModule
  ],
  exports:         [ WebixDataTableComponent ],
  entryComponents: [ WebixDataTableComponent ]
})
export class WebixDataTableModule {}
