import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBar } from '@angular/material/progress-bar';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import {
  filter,
  map,
} from 'rxjs/operators';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Navigation Progress Bar',
  category: 'Layout',
  description: 'Indeterminate progress bar that is shown while the router navigates. In the styleguide no navigation has completed yet, so the bar is shown.',
  status: 'stable',
  canvasLayout: 'stretch',
  variants: [
    { name: 'Navigating' },
  ],
})
@Component({
    selector: 'rxap-navigation-progress-bar',
    templateUrl: './navigation-progress-bar.component.html',
    styleUrls: ['./navigation-progress-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatProgressBar,
    ]
})
export class NavigationProgressBarComponent {

  public readonly router = inject(Router);

  public readonly navigating = toSignal(this.router.events.pipe(
    filter(
      event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel,
    ),
    map(event => event instanceof NavigationStart),
  ), { initialValue: true });

}
