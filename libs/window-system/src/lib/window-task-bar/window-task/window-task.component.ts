import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { WindowRef } from '../../window-ref';
import { StopPropagationDirective } from '@rxap/directives';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import {
  NgClass,
  NgIf,
  AsyncPipe
} from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector:        'rxap-window-task',
  templateUrl:     './window-task.component.html',
  styleUrls:       [ './window-task.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone:      true,
  imports:         [ FlexModule, NgClass, ExtendedModule, NgIf, MatIconModule, IconDirective, MatLegacyButtonModule, StopPropagationDirective, AsyncPipe ]
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
