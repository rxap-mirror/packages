import {
  Component,
  ChangeDetectionStrategy,
  Inject,
} from '@angular/core';
import {Observable} from 'rxjs';
import {UserService} from '@rxap/authentication';
import {map} from 'rxjs/operators';
import {isDefined} from '@rxap/rxjs';
import {MatIconModule} from '@angular/material/icon';
import {
  NgIf,
  AsyncPipe,
} from '@angular/common';
import {AvatarBackgroundImageDirective} from '@rxap/directives';
import {MatMenuModule} from '@angular/material/menu';
import {FlexModule} from '@angular/flex-layout/flex';

@Component({
  selector: 'rxap-user-profile-icon',
  templateUrl: './user-profile-icon.component.html',
  styleUrls: ['./user-profile-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
    MatMenuModule,
    AvatarBackgroundImageDirective,
    NgIf,
    MatIconModule,
    AsyncPipe,
  ],
})
export class UserProfileIconComponent {
  public userProfileUrl$: Observable<string | undefined>;
  public userName$: Observable<string>;

  constructor(
    @Inject(UserService)
    public userService: UserService,
  ) {
    this.userProfileUrl$ = this.userService.user$.pipe(
      isDefined(),
      map((user) => user.photoURL ?? user.avatarUrl),
    );
    this.userName$ = this.userService.user$.pipe(
      isDefined(),
      map(
        (user) =>
          user.name ??
          (user.firstname || user.lastname
            ? [user.firstname, user.lastname].join(' ').trim()
            : null) ??
          user.username,
      ),
    );
  }
}
