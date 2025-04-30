import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  NgClass,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  Renderer2,
  signal,
  SimpleChanges,
  viewChild,
  ViewEncapsulation, AfterViewInit,
} from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { IconDirective } from '@rxap/material-directives/icon';
import { coerceArray } from '@rxap/utilities';
import {
  debounceTime,
  Subscription,
} from 'rxjs';
import {
  filter,
  startWith,
  tap,
} from 'rxjs/operators';
import { LayoutService } from '../../layout.service';
import {
  Navigation,
  NavigationDividerItem,
  NavigationItem,
} from '../navigation-item';
import { NavigationComponent } from '../navigation.component';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'li[rxap-navigation-item]',
    templateUrl: './navigation-item.component.html',
    styleUrls: ['./navigation-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('sub-nav', [
            transition(':enter', [
                style({
                    display: 'block',
                    height: '0',
                    overflow: 'hidden',
                }),
                animate(150, style({ height: '*' })),
            ]),
            transition(':leave', [
                style({ overflow: 'hidden' }),
                animate(300, style({ height: '0' })),
                style({ display: 'none' }),
            ]),
        ]),
    ],
    imports: [
        RouterLinkActive,
        RouterLink,
        NgIf,
        MatRippleModule,
        MatIconModule,
        IconDirective,
        MatDividerModule,
        forwardRef(() => NavigationComponent),
        NgClass,
    ]
})
export class NavigationItemComponent
  implements OnChanges, OnDestroy, AfterViewInit {

  public readonly level = input(0);

  public children: Navigation | null = null;

  public readonly item = input.required<NavigationItem>();
  public readonly active = signal(false);

  public readonly itemClasses = computed(() => {
    let classes = `level-${ this.level() * 4 }`;
    if (this.collapsed()) {
      classes += ' invisible';
    }
    return classes;
  });

  protected readonly layoutService = inject(LayoutService);

  public readonly collapsed = computed(() => this.layoutService.collapsed());

  protected readonly _subscription = new Subscription();

  protected readonly router = inject(Router);
  protected readonly elementRef = inject(ElementRef);
  protected readonly renderer = inject(Renderer2);

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['item']) {
      const item: NavigationItem = changes['item'].currentValue;
      this.children =
        item.children && item.children.length ? item.children : null;
    }
  }

  public ngAfterViewInit() {
    this._subscription.add(
      this.router.events
          .pipe(
            filter((event) => event instanceof NavigationEnd),
            debounceTime(100),
            startWith(true),
            tap(() => {
              let isActive = true;
              const urlParts = this.router.url.split('/');
              if (urlParts[0] === '') {
                urlParts[0] = '/';
              }
              const routerLink = coerceArray(this.item().routerLink).map(fragment => fragment.split('/')).flat();
              if (routerLink[0] === '') {
                routerLink[0] = '/';
              }
              for (let i = 0; i < routerLink.length; i++) {
                if (urlParts[i] !== routerLink[i]) {
                  isActive = false;
                  break;
                }
              }
              this.active.set(isActive);
              if (isActive) {
                this.renderer.addClass(this.elementRef.nativeElement, 'active');
              } else {
                this.renderer.removeClass(this.elementRef.nativeElement, 'active');
              }
            }),
          )
          .subscribe(),
    );
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
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
