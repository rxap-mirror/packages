import {
  AsyncPipe,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  INJECTOR,
  input,
  OnInit,
  runInInjectionContext,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutService } from '../layout.service';
import { NavigationService } from '../navigation.service';
import {
  Navigation,
  NavigationDividerItem,
  NavigationItem,
} from './navigation-item';
import { NavigationItemComponent } from './navigation-item/navigation-item.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ul[rxap-navigation]',
  templateUrl: './navigation.component.html',
  styleUrls: [ './navigation.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'list-none dark:text-neutral-400 text-neutral-700',
  },
  imports: [
    NgFor,
    NgIf,
    MatDividerModule,
    forwardRef(() => NavigationItemComponent),
    AsyncPipe,
  ],
})
export class NavigationComponent implements OnInit {

  public items = input<Navigation>();

  public level = input(0);

  private readonly navigationService = inject(NavigationService);

  private readonly layoutService = inject(LayoutService);

  public readonly collapsed = computed(() => this.layoutService.collapsed());

  public navigationItems = computed(() => this.items() ?? []);

  public readonly root = input(false);

  private readonly injector = inject(INJECTOR);

  public ngOnInit(): void {
    if (this.root()) {
      runInInjectionContext(this.injector, () => {
        this.navigationItems = toSignal(this.navigationService.config$, { initialValue: [] });
      });
    }
  }
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
