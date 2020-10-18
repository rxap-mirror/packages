import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  templateUrl:     './empty-router-outlet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyRouterOutletComponent {}
