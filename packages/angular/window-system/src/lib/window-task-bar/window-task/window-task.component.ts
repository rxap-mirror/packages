import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { WindowRef } from '../../window-ref';
import { StopPropagationDirective } from '@rxap/directives';
import { MatButtonModule } from '@angular/material/button';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector: 'rxap-window-task',
  templateUrl: './window-task.component.html',
  styleUrls: [ './window-task.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
    NgClass,
    ExtendedModule,
    NgIf,
    MatIconModule,
    IconDirective,
    MatButtonModule,
    StopPropagationDirective,
    AsyncPipe,
  ],
})
export class WindowTaskComponent {

  @Input() @Required public window!: WindowRef<any>;

  public close() {
    this.window.complete();
  }

  public reopen() {
    this.window.reopen();
  }

}
