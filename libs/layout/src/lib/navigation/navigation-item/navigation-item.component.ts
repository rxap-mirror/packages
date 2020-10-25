import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  HostBinding,
  ViewEncapsulation,
  ElementRef,
  Renderer2,
  HostListener,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  EmbeddedViewRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  Required,
  DebounceCall
} from '@rxap/utilities';
import {
  trigger,
  style,
  transition,
  animate
} from '@angular/animations';
import {
  NavigationItem,
  Navigation
} from '../navigation-item';
import {
  RouterLinkActive,
  Router,
  NavigationEnd
} from '@angular/router';
import { Subscription } from 'rxjs';
import {
  filter,
  tap,
  delay,
  startWith,
  distinctUntilChanged,
  skip
} from 'rxjs/operators';
import { SidenavComponentService } from '../../sidenav/sidenav.component.service';
import {
  Overlay,
  OverlayRef
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector:        'li[rxap-navigation-item]',
  templateUrl:     './navigation-item.component.html',
  styleUrls:       [ './navigation-item.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation:   ViewEncapsulation.None,
  host:            {
    class: 'rxap-navigation-item'
  },
  animations:      [
    trigger('sub-nav', [
      transition(':enter', [
        style({ display: 'block', height: '0', overflow: 'hidden' }),
        animate(150, style({ height: '*' }))
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate(300, style({ height: '0' })),
        style({ display: 'none' })
      ])
    ])
  ]
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
  public level: number = 0;

  @HostBinding('class.active')
  public isActive: boolean = false;

  @ViewChild('navigationOverlay')
  private _navigationOverlay!: TemplateRef<any>;

  private readonly _subscription = new Subscription();

  private _overlayRef?: OverlayRef;
  private _embeddedViewRef?: EmbeddedViewRef<any>;

  /**
   * indicates the mouse is over the
   */
  public lockeOverlay: boolean = false;

  constructor(
    private readonly router: Router,
    public readonly sidenav: SidenavComponentService,
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.item) {
      const item: NavigationItem = changes.item.currentValue;
      this.children              = item.children && item.children.length ? item.children : null;
    }
  }

  public ngAfterViewInit() {
    this._subscription.add(this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
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
          this.renderer.removeClass(this.elementRef.nativeElement, 'active');
        }
      })
    ).subscribe());
  }

  public ngOnInit() {
    // detach the navigation overlay if the sidenav collapsed
    // state is changed
    this._subscription.add(this.sidenav.collapsed$.pipe(
      skip(1),
      distinctUntilChanged(),
      tap(() => this._overlayRef?.detach())
    ).subscribe());
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
                                      originY:  'top',
                                      originX:  'end',
                                      overlayY: 'top',
                                      overlayX: 'start'
                                    }
                                  ])
          });
        }
        if (!this._overlayRef.hasAttached()) {
          this._embeddedViewRef = this._overlayRef.attach(
            new TemplatePortal(this._navigationOverlay, this.viewContainerRef)
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

}
