import { NgModule } from '@angular/core';
import { WindowTaskBarComponent } from './window-task-bar.component';
import { WindowTaskComponent } from './window-task/window-task.component';
import { WindowTaskBarContainerComponent } from './window-task-bar-container/window-task-bar-container.component';

@NgModule({
  imports: [
    WindowTaskBarComponent, WindowTaskComponent, WindowTaskBarContainerComponent,
  ],
  exports: [ WindowTaskBarComponent, WindowTaskBarContainerComponent ],
})
export class WindowTaskBarModule {}
