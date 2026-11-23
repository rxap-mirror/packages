import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { WindowRef } from '../../window-ref';
import { StopPropagationDirective } from '@rxap/directives';
import { MatButtonModule } from '@angular/material/button';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, NgClass } from '@angular/common';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Window Task',
  description: 'Entry of the task bar for one open window: shows the icon and the title of the window, reopens a minimized window on click and closes the window with the close button.',
  partOf: 'rxap-window-task-bar',
  status: 'stable',
})
@Component({
    selector: 'rxap-window-task',
    templateUrl: './window-task.component.html',
    styleUrls: ['./window-task.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    NgClass,
    MatIconModule,
    IconDirective,
    MatButtonModule,
    StopPropagationDirective,
    AsyncPipe
]
})
export class WindowTaskComponent {

  public readonly window = input.required<WindowRef<any>>();

  public close() {
    this.window().complete();
  }

  public reopen() {
    this.window().reopen();
  }

}
