import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnDestroy,
  AfterViewInit
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
  delay
} from 'rxjs/operators';

@Component({
  selector:        'rxap-navigation-item',
  templateUrl:     './navigation-item.component.html',
  styleUrls:       [ './navigation-item.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            {
    class: 'rxap-navigation-item'
  },
  animations:      [
    trigger('sub-nav', [
      transition(':enter', [
        style({ display: 'block', height: '0', overflow: 'hidden' }),
        animate(300, style({ height: '*' }))
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

  public expanded = false;

  private _subscription?: Subscription;

  constructor(private readonly router: Router) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.item) {
      const item: NavigationItem = changes.item.currentValue;
      this.children = item.children && item.children.length ? item.children : null;
    }
  }

  public ngAfterViewInit() {
    this.updateExpanded();
    this._subscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      delay(100),
      tap(() => this.updateExpanded())
    ).subscribe();
  }

  public updateExpanded(): void {
    if (this.routerLinkActive.isActive) {
      if (!this.expanded) {
        this.expanded = true;
      }
    }
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

}
