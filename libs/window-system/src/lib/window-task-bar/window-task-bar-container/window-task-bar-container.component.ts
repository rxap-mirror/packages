import {
  Component,
  Inject,
  InjectionToken,
  Optional
} from '@angular/core';
import { WindowService } from '../../window.service';
import { WindowTaskBarComponent } from '../window-task-bar.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf } from '@angular/common';

export interface WindowTaskBarContainerSettings {
  expand?: boolean;
}

export const RXAP_WINDOW_TASK_BAR_CONTAINER_SETTINGS = new InjectionToken('rxap/window-system/task-bar-container');

@Component({
  selector:    'rxap-window-task-bar-container',
  templateUrl: './window-task-bar-container.component.html',
  styleUrls:   [ './window-task-bar-container.component.scss' ],
  standalone:  true,
  imports:     [ NgIf, FlexModule, MatLegacyButtonModule, MatBadgeModule, MatIconModule, MatToolbarModule, ExtendedModule, WindowTaskBarComponent ]
})
export class WindowTaskBarContainerComponent {

  public expand = true;

  constructor(
    @Inject(WindowService)
    public windowService: WindowService,
    @Optional()
    @Inject(RXAP_WINDOW_TASK_BAR_CONTAINER_SETTINGS)
    settings: WindowTaskBarContainerSettings | null = null
  ) {
    if (settings) {
      if (settings.expand !== undefined) {
        this.expand = settings.expand
      }
    }
  }

}
