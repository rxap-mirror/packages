import { NgModule } from '@angular/core';
import { TableSelectControlsComponentModule } from '@rxap/material-table-system';
import { WindowTableSelectService } from './window-table-select.service';

@NgModule({
  exports: [TableSelectControlsComponentModule],
  providers: [WindowTableSelectService]
})
export class WindowTableSelectModule {}
