import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Showcase } from '@ng-prism/core';

@Showcase<EmptyRouterOutletComponent>({
  title: 'Empty Router Outlet',
  category: 'Components',
  description: 'Component that only renders a `router-outlet`. It is used as parent route component to group child routes. Without an activated child route it renders nothing, the dashed frame is only part of the showcase.',
  status: 'stable',
  host: { template: '<div style="min-width: 240px; min-height: 48px; padding: 8px; border: 1px dashed currentColor"><rxap-empty-router-outlet /></div>' },
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    // the selector is required to prevent a component ID collision with the component ɵEmptyOutletComponent from the @angular/router package
    selector: 'rxap-empty-router-outlet',
    templateUrl: './empty-router-outlet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet]
})
export class EmptyRouterOutletComponent {
}
