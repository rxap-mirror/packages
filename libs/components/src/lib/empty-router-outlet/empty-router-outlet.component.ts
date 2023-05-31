import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  templateUrl:     './empty-router-outlet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone:      true,
  imports:         [ RouterOutlet ]
})
export class EmptyRouterOutletComponent {}
