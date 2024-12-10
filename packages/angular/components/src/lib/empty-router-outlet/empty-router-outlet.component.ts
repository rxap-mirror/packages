import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    // the selector is required to prevent a component ID collision with the component ɵEmptyOutletComponent from the @angular/router package
    selector: 'rxap-empty-router-outlet',
    templateUrl: './empty-router-outlet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet]
})
export class EmptyRouterOutletComponent {
}
