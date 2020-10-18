import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Inject,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Navigation } from './navigation-item';
import {
  Required,
  coerceBoolean
} from '@rxap/utilities';
import { RXAP_NAVIGATION_CONFIG } from '../tokens';
import { NavigationService } from './navigation.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector:        'rxap-navigation',
  templateUrl:     './navigation.component.html',
  styleUrls:       [ './navigation.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rxap-navigation' }
})
export class NavigationComponent implements OnInit, OnDestroy {

  private _root = false;

  @Input()
  public set root(value: boolean | '') {
    this._root = coerceBoolean(value);
  }

  @Input()
  @Required
  public items!: Navigation;

  public subscription?: Subscription;

  constructor(
    private readonly navigationService: NavigationService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    if (this._root) {
      this.items = [];
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
