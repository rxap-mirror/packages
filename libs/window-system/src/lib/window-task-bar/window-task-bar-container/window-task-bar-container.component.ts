import {
  Component,
  Inject,
  InjectionToken,
  Optional
} from '@angular/core';
import { WindowService } from '../../window.service';

export interface WindowTaskBarContainerSettings {
  expand?: boolean;
}

export const RXAP_WINDOW_TASK_BAR_CONTAINER_SETTINGS = new InjectionToken('rxap/window-system/task-bar-container');

@Component({
  selector:    'rxap-window-task-bar-container',
  templateUrl: './window-task-bar-container.component.html',
  styleUrls:   [ './window-task-bar-container.component.scss' ]
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
