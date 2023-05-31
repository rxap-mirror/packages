import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { WindowContentComponent } from '../window-content/window-content.component';
import { WindowContainerComponent } from '../window-container/window-container.component';

@Component({
  selector:        'rxap-default-window',
  templateUrl:     './default-window.component.html',
  styleUrls:       [ './default-window.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone:      true,
  imports:         [ WindowContainerComponent, WindowContentComponent ]
})
export class DefaultWindowComponent {}
