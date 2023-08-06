import {
  AsyncPipe,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { coerceBoolean } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SidenavComponentService } from '../sidenav/sidenav.component.service';
import {
  Navigation,
  NavigationDividerItem,
  NavigationItem,
} from './navigation-item';
import { NavigationItemComponent } from './navigation-item/navigation-item.component';
import { NavigationService } from './navigation.service';

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
export class NavigationComponent implements OnInit, OnDestroy {
  @Input()
  public items!: Navigation;
  public subscription?: Subscription;
  @Input()
  public level = 0;

  constructor(
    @Inject(NavigationService)
    private readonly navigationService: NavigationService,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
    @Inject(SidenavComponentService)
    public readonly sidenav: SidenavComponentService,
  ) {
  }

  @HostBinding('class.rxap-root-navigation')
  public _root = false;

  @Input()
  public set root(value: boolean | '') {
    this._root = coerceBoolean(value);
  }

  public ngOnInit(): void {
    if (this._root) {
      this.items = [];
      this.subscription = this.navigationService.config$
                              .pipe(
                                tap((navigation) => (this.items = navigation)),
                                tap(() => this.cdr.detectChanges()),
                              )
                              .subscribe();
    }
    this.items ??= [];
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
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
