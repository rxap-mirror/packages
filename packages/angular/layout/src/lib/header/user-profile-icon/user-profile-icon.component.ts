import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  InjectionToken,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RxapAuthenticationService } from '@rxap/authentication';
import { UserProfileDataSource } from '@rxap/ngx-user';
import {
  distinctUntilChanged,
  filter,
  skip,
} from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';

export type ExtractUsernameFromProfileFn<T = unknown> = (profile: T) => string | null;

export const EXTRACT_USERNAME_FROM_PROFILE = new InjectionToken<ExtractUsernameFromProfileFn>(
  'extract-username-from-profile',
  {
    providedIn: 'root',
    factory: () => (profile: any) => (profile ? profile.username ?? profile.email ?? profile.name : null) ?? null,
  },
);

@Component({
  selector: 'rxap-user-profile-icon',
  templateUrl: './user-profile-icon.component.html',
  styleUrls: [ './user-profile-icon.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatMenuModule,
    MatIconModule,
    NgIf,
    AsyncPipe,
  ],
})
export class UserProfileIconComponent<T = unknown> {

  public username: Signal<string | null>;

  constructor(
    private readonly userProfileService: UserProfileDataSource<T>,
    private readonly authenticationService: RxapAuthenticationService,
    @Inject(EXTRACT_USERNAME_FROM_PROFILE)
      extractUsernameFromProfile: ExtractUsernameFromProfileFn<T>,
  ) {
    this.username = toSignal(this.authenticationService.isAuthenticated$.pipe(
      filter(Boolean),
      switchMap(() => this.userProfileService.connect({
        viewChange: this.authenticationService.isAuthenticated$.pipe(
          skip(1),
          filter(Boolean),
          distinctUntilChanged(),
        ),
      })),
      filter(Boolean),
      map(extractUsernameFromProfile),
    ), { initialValue: null });
  }

  public async logout() {
    await this.authenticationService.signOut();
  }


}
