import {NgModule} from '@angular/core';
import {TableSelectControlsComponent} from '@rxap/material-table-system';
import {WindowTableSelectService} from './window-table-select.service';

@NgModule({
  imports: [TableSelectControlsComponent],
  exports: [TableSelectControlsComponent],
  providers: [WindowTableSelectService],
})
export class WindowTableSelectModule {
}
