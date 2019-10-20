import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowTaskBarComponent } from './window-task-bar.component';
import { WindowTaskComponent } from './window-task/window-task.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatIconModule,
  MatToolbarModule,
  MatBadgeModule,
  MatButtonModule
} from '@angular/material';

@NgModule({
  declarations: [ WindowTaskBarComponent, WindowTaskComponent ],
  imports:      [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatToolbarModule,
    MatBadgeModule,
    MatButtonModule
  ],
  exports:      [ WindowTaskBarComponent ]
})
export class WindowTaskBarModule {}
