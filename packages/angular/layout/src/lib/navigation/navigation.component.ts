import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  ChangeDetectorRef,
  ViewEncapsulation,
  HostBinding,
  Inject,
} from '@angular/core';
import {
  Navigation,
  NavigationItem,
  NavigationDividerItem,
} from './navigation-item';
import {
  Required,
  coerceBoolean,
} from '@rxap/utilities';
import {NavigationService} from './navigation.service';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {SidenavComponentService} from '../sidenav/sidenav.component.service';
import {NavigationItemComponent} from './navigation-item/navigation-item.component';
import {FlexModule} from '@angular/flex-layout/flex';
import {MatDividerModule} from '@angular/material/divider';
import {
  NgFor,
  NgIf,
  AsyncPipe,
} from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ul[rxap-navigation]',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {class: 'rxap-navigation'},
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatDividerModule,
    FlexModule,
    NavigationItemComponent,
    AsyncPipe,
  ],
})
export class NavigationComponent implements OnInit, OnDestroy {
  @HostBinding('class.rxap-root-navigation')
  public _root = false;

  @Input()
  public set root(value: boolean | '') {
    this._root = coerceBoolean(value);
  }

  @Input()
  @Required
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
