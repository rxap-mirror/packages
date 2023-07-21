import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  signal,
} from '@angular/core';
import { RXAP_LAYOUT_APPS_GRID } from '../../tokens';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';
import {
  NgFor,
  NgIf,
  NgOptimizedImage,
} from '@angular/common';
import {
  AppUrlService,
  ExternalApps,
} from '../../app-url.service';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  Subscription,
  switchMap,
} from 'rxjs';
import {
  filter,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'rxap-apps-button',
  templateUrl: './apps-button.component.html',
  styleUrls: [ './apps-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    FlexModule,
    NgFor,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
  ],
})
export class AppsButtonComponent implements OnInit, OnDestroy {
  public isOpen = false;

  public readonly appList = signal<Array<ExternalApps>>([]);

  private _subscription?: Subscription;

  constructor(
    @Optional()
    @Inject(RXAP_LAYOUT_APPS_GRID)
      grid: any,
    private readonly appUrlService: AppUrlService,
    private readonly authenticationService: RxapAuthenticationService,
  ) {}

  ngOnInit() {
    this._subscription = this.authenticationService.isAuthenticated$.pipe(
      filter(Boolean),
      switchMap(() => this.appUrlService.getAppList()),
      tap((apps) => this.appList.set(apps)),
    ).subscribe();
  }

  ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

}
