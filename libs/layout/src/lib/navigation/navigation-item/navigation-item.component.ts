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
  ChangeDetectorRef,
  ElementRef,
  Renderer2
} from '@angular/core';
import { Required } from '@rxap/utilities';
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
  startWith
} from 'rxjs/operators';
import { SidenavComponentService } from '../../sidenav/sidenav.component.service';

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
export class NavigationItemComponent implements OnChanges, AfterViewInit, OnDestroy {

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

  private _subscription?: Subscription;

  constructor(
    private readonly router: Router,
    public readonly sidenav: SidenavComponentService,
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2
  ) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.item) {
      const item: NavigationItem = changes.item.currentValue;
      this.children              = item.children && item.children.length ? item.children : null;
    }
  }

  public ngAfterViewInit() {
    // this.updateExpanded();
    this._subscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(true),
      delay(100),
      tap(() => {
        if (this.routerLinkActive.isActive) {
          this.renderer.addClass(this.elementRef.nativeElement, 'active');
        } else {
          this.renderer.removeClass(this.elementRef.nativeElement, 'active');
        }
      })
    ).subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

}
