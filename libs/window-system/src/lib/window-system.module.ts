import { NgModule } from '@angular/core';
import {
  MatToolbarModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';
import { WindowContainerComponent } from './window-container/window-container.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WindowToolBarComponent } from './window-tool-bar/window-tool-bar.component';
import { WindowResizerComponent } from './window-resizer/window-resizer.component';
import { DefaultWindowComponent } from './default-window/default-window.component';
import { WindowContentComponent } from './window-content/window-content.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { WindowService } from './window.service';

@NgModule({
  imports:         [
    MatToolbarModule,
    FlexLayoutModule,
    CommonModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    OverlayModule
  ],
  declarations:    [
    WindowContainerComponent,
    WindowToolBarComponent,
    WindowResizerComponent,
    DefaultWindowComponent,
    WindowContentComponent
  ],
  entryComponents: [
    DefaultWindowComponent
  ],
  exports:         [
    WindowContainerComponent,
    WindowToolBarComponent,
    WindowResizerComponent,
    DefaultWindowComponent,
    WindowContentComponent
  ],
  providers:       [
    WindowService
  ]
})
export class RxapWindowSystemModule {}
