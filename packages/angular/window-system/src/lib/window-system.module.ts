import { NgModule } from '@angular/core';
import { WindowContainerComponent } from './window-container/window-container.component';
import { WindowToolBarComponent } from './window-tool-bar/window-tool-bar.component';
import { WindowResizerComponent } from './window-resizer/window-resizer.component';
import { DefaultWindowComponent } from './default-window/default-window.component';
import { WindowContentComponent } from './window-content/window-content.component';
import { WindowActionBarComponent } from './window-action-bar/window-action-bar.component';
import { WindowTaskBarModule } from './window-task-bar/window-task-bar.module';

@NgModule({
  imports: [
    WindowContainerComponent,
    WindowToolBarComponent,
    WindowResizerComponent,
    DefaultWindowComponent,
    WindowContentComponent,
    WindowActionBarComponent,
  ],
  exports: [
    WindowContainerComponent,
    WindowToolBarComponent,
    WindowResizerComponent,
    DefaultWindowComponent,
    WindowContentComponent,
    WindowTaskBarModule,
  ],
})
export class RxapWindowSystemModule {}
