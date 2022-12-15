import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WindowContainerComponent } from './window-container/window-container.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WindowToolBarComponent } from './window-tool-bar/window-tool-bar.component';
import { WindowResizerComponent } from './window-resizer/window-resizer.component';
import { DefaultWindowComponent } from './default-window/default-window.component';
import { WindowContentComponent } from './window-content/window-content.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { WindowActionBarComponent } from './window-action-bar/window-action-bar.component';
import { WindowTaskBarModule } from './window-task-bar/window-task-bar.module';
import { PortalModule } from '@angular/cdk/portal';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { IconDirectiveModule } from '@rxap/material-directives/icon';

@NgModule({
  imports:      [
    MatToolbarModule,
    FlexLayoutModule,
    CommonModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    OverlayModule,
    PortalModule,
    MatProgressBarModule,
    IconDirectiveModule
  ],
  declarations: [
    WindowContainerComponent,
    WindowToolBarComponent,
    WindowResizerComponent,
    DefaultWindowComponent,
    WindowContentComponent,
    WindowActionBarComponent
  ],
  exports:      [
    WindowContainerComponent,
    WindowToolBarComponent,
    WindowResizerComponent,
    DefaultWindowComponent,
    WindowContentComponent,
    WindowTaskBarModule
  ]
})
export class RxapWindowSystemModule { }
