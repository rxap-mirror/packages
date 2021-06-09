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
import { Required, coerceBoolean } from '@rxap/utilities';
import { NavigationService } from './navigation.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ul[rxap-navigation]',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'rxap-navigation' },
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
  public level: number = 0;

  constructor(
    @Inject(NavigationService)
    private readonly navigationService: NavigationService,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    if (this._root) {
      this.items = [];
      this.subscription = this.navigationService.config$
        .pipe(
          tap((navigation) => (this.items = navigation)),
          tap(() => this.cdr.detectChanges())
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
    item: NavigationItem | NavigationDividerItem
  ): item is NavigationDividerItem {
    return (item as any)['divider'];
  }

  public isNavigationItem(
    item: NavigationItem | NavigationDividerItem
  ): item is NavigationItem {
    return !this.isNavigationDividerItem(item);
  }

  public asNavigationItem(
    item: NavigationItem | NavigationDividerItem
  ): NavigationItem {
    if (!this.isNavigationItem(item)) {
      throw new Error('The item is not a NavigationItem');
    }
    return item;
  }

  // endregion
}
