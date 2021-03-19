import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowTaskBarComponent } from './window-task-bar.component';
import { WindowTaskComponent } from './window-task/window-task.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WindowTaskBarContainerComponent } from './window-task-bar-container/window-task-bar-container.component';
import { StopPropagationDirectiveModule } from '@rxap/directives';
import { IconDirectiveModule } from '@rxap/material-directives/icon';

@NgModule({
  declarations:    [ WindowTaskBarComponent, WindowTaskComponent, WindowTaskBarContainerComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatToolbarModule,
    MatBadgeModule,
    MatButtonModule,
    StopPropagationDirectiveModule,
    IconDirectiveModule
  ],
  entryComponents: [ WindowTaskBarComponent ],
  exports:         [ WindowTaskBarComponent, WindowTaskBarContainerComponent ]
})
export class WindowTaskBarModule {}
