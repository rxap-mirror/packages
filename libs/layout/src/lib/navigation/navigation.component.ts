import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  ChangeDetectorRef,
  ViewEncapsulation,
  HostBinding
} from '@angular/core';
import { Navigation } from './navigation-item';
import {
  Required,
  coerceBoolean
} from '@rxap/utilities';
import { NavigationService } from './navigation.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector:        'ul[rxap-navigation]',
  templateUrl:     './navigation.component.html',
  styleUrls:       [ './navigation.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation:   ViewEncapsulation.None,
  host:            { class: 'rxap-navigation' }
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
    private readonly navigationService: NavigationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    if (this._root) {
      this.items        = [];
      this.subscription = this.navigationService.config$.pipe(
        tap(navigation => this.items = navigation),
        tap(() => this.cdr.detectChanges())
      ).subscribe();
    }
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
