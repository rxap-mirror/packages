import { Component, InjectionToken, inject, ChangeDetectionStrategy } from '@angular/core';
import { WindowService } from '../../window.service';
import { WindowTaskBarComponent } from '../window-task-bar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { Showcase } from '@ng-prism/core';

export interface WindowTaskBarContainerSettings {
  expand?: boolean;
}

export const RXAP_WINDOW_TASK_BAR_CONTAINER_SETTINGS = new InjectionToken('rxap/window-system/task-bar-container');

@Showcase({
  title: 'Window Task Bar Container',
  category: 'Window System',
  description: 'Collapsible container with a badge for the number of open windows that wraps the task bar. It is only rendered while windows are open. The styleguide host reports two open windows.',
  status: 'stable',
  variants: [
    { name: 'Open windows' },
  ],
})
@Component({
    selector: 'rxap-window-task-bar-container',
    templateUrl: './window-task-bar-container.component.html',
    styleUrls: ['./window-task-bar-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    MatButtonModule,
    MatBadgeModule,
    MatIconModule,
    MatToolbarModule,
    WindowTaskBarComponent,
    NgClass
]
})
export class WindowTaskBarContainerComponent {
  windowService = inject<WindowService>(WindowService);


  public expand = true;

  constructor() {
    const settings = inject<WindowTaskBarContainerSettings | null>(RXAP_WINDOW_TASK_BAR_CONTAINER_SETTINGS, { optional: true }) ?? null;

    if (settings) {
      if (settings.expand !== undefined) {
        this.expand = settings.expand;
      }
    }
  }

}
