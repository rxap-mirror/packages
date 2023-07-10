import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EmbeddedViewRef,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  DebounceCall,
  Required,
} from '@rxap/utilities';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Navigation,
  NavigationDividerItem,
  NavigationItem,
} from '../navigation-item';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { Subscription } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  skip,
  startWith,
  tap,
} from 'rxjs/operators';
import { SidenavComponentService } from '../../sidenav/sidenav.component.service';
import {
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FlexModule } from '@angular/flex-layout/flex';
import { NavigationComponent } from '../navigation.component';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import {
  AsyncPipe,
  NgFor,
  NgIf,
} from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[rxap-navigation-item]',
  templateUrl: './navigation-item.component.html',
  styleUrls: [ './navigation-item.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'rxap-navigation-item',
  },
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
    MatRippleModule,
    RouterLink,
    MatTooltipModule,
    NgIf,
    MatIconModule,
    IconDirective,
    NavigationComponent,
    FlexModule,
    NgFor,
    AsyncPipe,
  ],
})
export class NavigationItemComponent
  implements OnChanges, AfterViewInit, OnDestroy, OnInit {
  public children: Navigation | null = null;

  @ViewChild(RouterLinkActive, { static: true })
  public routerLinkActive!: RouterLinkActive;

  @Input()
  @Required
  public item!: NavigationItem;

  @Input()
  public level = 0;

  @HostBinding('class.active')
  public isActive = false;

  @ViewChild('navigationOverlay')
  private _navigationOverlay!: TemplateRef<any>;

  private readonly _subscription = new Subscription();

  private _overlayRef?: OverlayRef;
  private _embeddedViewRef?: EmbeddedViewRef<any>;

  /**
   * indicates the mouse is over the
   */
  public lockeOverlay = false;

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
            startWith(true),
            delay(100),
            tap(() => {
              if (this.routerLinkActive.isActive) {
                if (!this.sidenav.collapsed$.value) {
                  // only close the overlay if sidenav collapsed
                  this._overlayRef?.detach();
                }
                this.renderer.addClass(this.elementRef.nativeElement, 'active');
              } else {
                this.renderer.removeClass(
                  this.elementRef.nativeElement,
                  'active',
                );
              }
            }),
          )
          .subscribe(),
    );
  }

  public ngOnInit() {
    // detach the navigation overlay if the sidenav collapsed
    // state is changed
    this._subscription.add(
      this.sidenav.collapsed$
          .pipe(
            skip(1),
            distinctUntilChanged(),
            tap(() => this._overlayRef?.detach()),
          )
          .subscribe(),
    );
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
    this._overlayRef?.dispose();
  }

  @HostListener('mouseenter')
  public onMouseenter() {
    if (this.children) {
      if (!this.routerLinkActive.isActive || this.sidenav.collapsed$.value) {
        if (!this._overlayRef) {
          this._overlayRef = this.overlay.create({
            positionStrategy: this.overlay
                                  .position()
                                  .flexibleConnectedTo(this.elementRef)
                                  .withPositions([
                                    {
                                      originY: 'top',
                                      originX: 'end',
                                      overlayY: 'top',
                                      overlayX: 'start',
                                    },
                                  ]),
          });
        }
        if (!this._overlayRef.hasAttached()) {
          this._embeddedViewRef = this._overlayRef.attach(
            new TemplatePortal(this._navigationOverlay, this.viewContainerRef),
          );
        }
      }
    }
  }

  @HostListener('mouseleave')
  @DebounceCall(100)
  public onMouseleave() {
    if (!this.lockeOverlay) {
      this._overlayRef?.detach();
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
