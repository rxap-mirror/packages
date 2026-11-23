import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WindowService } from '../window.service';
import { WindowTaskComponent } from './window-task/window-task.component';
import { Showcase } from '@ng-prism/core';


@Showcase({
  title: 'Window Task Bar',
  category: 'Window System',
  description: 'Task bar that lists the open windows of the `WindowService`. The styleguide host reports two open windows, one of them is minimized.',
  status: 'stable',
  variants: [
    { name: 'Open windows' },
  ],
})
@Component({
    selector: 'rxap-window-task-bar',
    templateUrl: './window-task-bar.component.html',
    styleUrls: ['./window-task-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WindowTaskComponent]
})
export class WindowTaskBarComponent {
  windowService = inject<WindowService>(WindowService);

  /**
   * Emits whenever the number of active windows changes. Reading the signal in the template
   * marks the component dirty so the window list is re-evaluated.
   */
  readonly activeCount = toSignal(this.windowService.activeCount$);

}
