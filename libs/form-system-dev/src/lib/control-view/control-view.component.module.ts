import { NgModule } from '@angular/core';
import { ControlViewComponent } from './control-view.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule
} from '@angular/material';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [ ControlViewComponent ],
  imports:      [
    NgxJsonViewerModule,
    FlexLayoutModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    CommonModule,
    MatCardModule
  ],
  exports:      [ ControlViewComponent ]
})
export class RxapControlViewComponentModule {}
