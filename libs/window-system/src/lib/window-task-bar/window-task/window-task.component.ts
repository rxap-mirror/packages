import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { WindowRef } from '../../window-ref';

@Component({
  selector:        'rxap-window-task',
  templateUrl:     './window-task.component.html',
  styleUrls:       [ './window-task.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
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
