import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { WindowRef } from '../../window-ref';
import { StopPropagationDirective } from '@rxap/directives';
import { MatButtonModule } from '@angular/material/button';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';

@Component({
  selector: 'rxap-window-task',
  templateUrl: './window-task.component.html',
  styleUrls: [ './window-task.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    MatIconModule,
    IconDirective,
    MatButtonModule,
    StopPropagationDirective,
    AsyncPipe,
  ],
})
export class WindowTaskComponent {

  @Input({ required: true }) public window!: WindowRef<any>;

  public close() {
    this.window.complete();
  }

  public reopen() {
    this.window.reopen();
  }

}
