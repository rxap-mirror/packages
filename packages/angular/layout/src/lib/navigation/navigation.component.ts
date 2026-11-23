import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutService } from '../layout.service';
import { NavigationService } from '../navigation.service';
import {
  Navigation,
  NavigationDividerItem,
  NavigationItem,
} from './navigation-item';
import { NavigationItemComponent } from './navigation-item/navigation-item.component';
import { Showcase } from '@ng-prism/core';

@Showcase<NavigationComponent>({
  title: 'Navigation',
  category: 'Layout',
  description: 'List of navigation items and dividers. A root navigation reads the items from the `NavigationService`, a nested navigation renders the `items` input.',
  status: 'stable',
  variants: [
    {
      name: 'Flat',
      inputs: {
        items: [
          { label: 'Dashboard', routerLink: '/dashboard' },
          { label: 'Users', routerLink: '/users' },
          { label: 'Settings', routerLink: '/settings' },
        ],
      },
    },
    {
      name: 'With icons',
      inputs: {
        items: [
          { label: 'Dashboard', routerLink: '/dashboard', icon: 'dashboard' },
          { label: 'Users', routerLink: '/users', icon: 'group' },
          { label: 'Settings', routerLink: '/settings', icon: 'settings' },
        ],
      },
    },
    {
      name: 'With divider',
      inputs: {
        items: [
          { label: 'Dashboard', routerLink: '/dashboard', icon: 'dashboard' },
          { divider: true, title: 'Administration' },
          { label: 'Users', routerLink: '/users', icon: 'group' },
          { label: 'Settings', routerLink: '/settings', icon: 'settings' },
        ],
      },
    },
  ],
})
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'ul[rxap-navigation]',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,

    host: {
        class: 'list-none dark:text-neutral-400 text-neutral-700',
    },
    imports: [
    MatDividerModule,
    forwardRef(() => NavigationItemComponent),
    AsyncPipe
]
})
export class NavigationComponent {

  public items = input<Navigation>();

  public level = input(0);

  protected readonly navigationService = inject(NavigationService);

  protected readonly layoutService = inject(LayoutService);

  public readonly collapsed = computed(() => this.layoutService.collapsed());

  public readonly root = input(false);

  /**
   * the navigation items of the configured navigation. Only subscribed if the component is the root navigation
   */
  private readonly rootItems = toSignal(
    toObservable(this.root).pipe(
      switchMap(root => root ? this.navigationService.config$ : EMPTY),
    ),
    { initialValue: [] as Navigation },
  );

  public readonly navigationItems = computed(() => this.root() ? this.rootItems() : (this.items() ?? []));

  // region type save item property

  // required to check the type of the item property in the ngFor loop

  public isNavigationDividerItem(
    item: NavigationItem | NavigationDividerItem,
  ): item is NavigationDividerItem {
    return (item as any)['divider'];
  }

  public isNavigationItem(
    item: NavigationItem | NavigationDividerItem,
  ): item is NavigationItem {
    return !this.isNavigationDividerItem(item);
  }

  public asNavigationItem(
    item: NavigationItem | NavigationDividerItem,
  ): NavigationItem {
    if (!this.isNavigationItem(item)) {
      throw new Error('The item is not a NavigationItem');
    }
    return item;
  }

  // endregion
}
