import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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

@Component({
  selector: 'rxap-navigation-progress-bar',
  templateUrl: './navigation-progress-bar.component.html',
  styleUrls: [ './navigation-progress-bar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatProgressBarModule,
  ],
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
