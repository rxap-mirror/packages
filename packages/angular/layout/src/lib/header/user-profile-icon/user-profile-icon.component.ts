import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  RxapAuthenticationService,
  RxapUserProfileService,
} from '@rxap/authentication';
import {
  filter,
  Subscription,
} from 'rxjs';
import {
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector: 'rxap-user-profile-icon',
  templateUrl: './user-profile-icon.component.html',
  styleUrls: [ './user-profile-icon.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
    MatMenuModule,
    MatIconModule,
    NgIf,
    AsyncPipe,
  ],
})
export class UserProfileIconComponent implements OnInit, OnDestroy {

  public username = signal<null | string>(null);

  private _subscription?: Subscription;

  constructor(
    private readonly userProfileService: RxapUserProfileService,
    private readonly authenticationService: RxapAuthenticationService,
  ) {}

  ngOnInit() {
    this._subscription = this.authenticationService.isAuthenticated$.pipe(
      filter(Boolean),
      switchMap(() => this.userProfileService.getProfile()),
      filter(Boolean),
      tap((user) => this.username.set(user.username ?? null)),
    ).subscribe();
  }

  ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public async logout() {
    await this.authenticationService.signOut();
  }


}
