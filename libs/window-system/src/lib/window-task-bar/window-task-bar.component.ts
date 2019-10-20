import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { WindowService } from '../window.service';

@Component({
  selector:        'rxap-window-task-bar',
  templateUrl:     './window-task-bar.component.html',
  styleUrls:       [ './window-task-bar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowTaskBarComponent {

  public expand = false;

  constructor(public windowService: WindowService) { }

}
