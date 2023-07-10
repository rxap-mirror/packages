import {
  Component,
  ChangeDetectionStrategy,
  Inject,
} from '@angular/core';
import {Observable} from 'rxjs';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
} from '@angular/router';
import {
  filter,
  map,
} from 'rxjs/operators';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {
  NgIf,
  AsyncPipe,
} from '@angular/common';

@Component({
  selector: 'rxap-navigation-progress-bar',
  templateUrl: './navigation-progress-bar.component.html',
  styleUrls: ['./navigation-progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, MatProgressBarModule, AsyncPipe],
})
export class NavigationProgressBarComponent {

  public navigating$: Observable<boolean>;

  public constructor(
    @Inject(Router) public readonly router: Router,
  ) {
    this.navigating$ = this.router.events.pipe(
      filter(
        event =>
          event instanceof NavigationStart ||
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel,
      ),
      map(event => event instanceof NavigationStart),
    );
  }

}
