import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  signal,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { Required } from '@rxap/utilities';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import {
  debounceTime,
  Subscription,
} from 'rxjs';
import {
  filter,
  startWith,
  tap,
} from 'rxjs/operators';
import { Overlay } from '@angular/cdk/overlay';
import { SidenavComponentService } from '../../sidenav/sidenav.component.service';
import { NavigationComponent } from '../navigation.component';
import { MatDividerModule } from '@angular/material/divider';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import {
  NgClass,
  NgIf,
} from '@angular/common';
import {
  Navigation,
  NavigationDividerItem,
  NavigationItem,
} from '../navigation-item';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[rxap-navigation-item]',
  templateUrl: './navigation-item.component.html',
  styleUrls: [ './navigation-item.component.scss' ],
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
  standalone: true,
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
  ],
})
export class NavigationItemComponent
  implements OnChanges, OnDestroy {

  @Input()
  public level = 0;

  private _isActive = false;

  public children: Navigation | null = null;

  @ViewChild(RouterLinkActive, { static: true })
  public routerLinkActive!: RouterLinkActive;

  @Input()
  @Required
  public item!: NavigationItem;

  public active = signal(false);

  @HostBinding('class.active')
  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
    this.active.set(value);
  }

  private readonly _subscription = new Subscription();

  constructor(
    @Inject(Router)
    private readonly router: Router,
    @Inject(SidenavComponentService)
    public readonly sidenav: SidenavComponentService,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef,
    @Inject(Renderer2)
    private readonly renderer: Renderer2,
    @Inject(Overlay)
    private readonly overlay: Overlay,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
  ) {
  }

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
              for (let i = 0; i < this.item.routerLink.length; i++) {
                if (urlParts[i] !== this.item.routerLink[i]) {
                  isActive = false;
                  break;
                }
              }
              this.isActive = isActive;
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
