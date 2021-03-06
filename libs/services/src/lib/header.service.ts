import {
  Injectable,
  Inject
} from '@angular/core';
import { Constructor } from '@rxap/utilities';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel
} from '@angular/router';
import {
  filter,
  map
} from 'rxjs/operators';

export interface SortedComponent {
  component: Constructor;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class HeaderService {

  public get countComponent(): number {
    return this.components.length + 1;
  }

  public readonly update$ = new Subject<void>();

  public navigating$: Observable<boolean>;
  private readonly components: Array<SortedComponent> = [];

  public constructor(
    @Inject(Router) public readonly router: Router
  ) {
    this.navigating$ = this.router.events.pipe(
      filter(
        event =>
          event instanceof NavigationStart ||
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel
      ),
      map(event => event instanceof NavigationStart)
    );
  }

  public addComponent(component: Constructor, order: number = 0): void {
    this.components.push({ component, order });
    this.update$.next();
  }

  /**
   * Returns all added components ordered based on the order property
   */
  public getComponents(): Array<Constructor> {
    return this
      .components
      .sort((a, b) => a.order - b.order)
      .map(item => item.component);
  }

}
