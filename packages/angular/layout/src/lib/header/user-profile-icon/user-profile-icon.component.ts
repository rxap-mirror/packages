import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
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
import { EXTRACT_USERNAME_FROM_PROFILE } from '../../tokens';
import { ExtractUsernameFromProfileFn } from '../../types';

@Component({
  selector: 'rxap-user-profile-icon',
  templateUrl: './user-profile-icon.component.html',
  styleUrls: [ './user-profile-icon.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatMenuModule,
    MatIconModule,
  ],
})
export class UserProfileIconComponent<T = unknown> {

  private readonly userProfileService: UserProfileDataSource<T> = inject(UserProfileDataSource);
  private readonly authenticationService = inject(RxapAuthenticationService);
  private readonly extractUsernameFromProfile: ExtractUsernameFromProfileFn<T> = inject(EXTRACT_USERNAME_FROM_PROFILE);

  public username: Signal<string | null>  = toSignal(this.authenticationService.isAuthenticated$.pipe(
    filter(Boolean),
    switchMap(() => this.userProfileService.connect({
      viewChange: this.authenticationService.isAuthenticated$.pipe(
        skip(1),
        filter(Boolean),
        distinctUntilChanged(),
      ),
    })),
    filter(Boolean),
    map(profile => this.extractUsernameFromProfile(profile)),
  ), { initialValue: null });

  public async logout() {
    await this.authenticationService.signOut();
  }


}
