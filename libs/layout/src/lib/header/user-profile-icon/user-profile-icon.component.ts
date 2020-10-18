import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '@rxap/authentication';
import { isDefined } from '@rxap/utilities';
import { map } from 'rxjs/operators';

@Component({
  selector:        'rxap-user-profile-icon',
  templateUrl:     './user-profile-icon.component.html',
  styleUrls:       [ './user-profile-icon.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-user-profile-icon' }
})
export class UserProfileIconComponent {

  public userProfileUrl$: Observable<string | undefined>;
  public userName$: Observable<string>;

  constructor(
    public userService: UserService,
  ) {
    this.userProfileUrl$ = this.userService.user$.pipe(
      isDefined(),
      map(user => user.photoURL ?? user.avatarUrl)
    );
    this.userName$ = this.userService.user$.pipe(
      isDefined(),
      map(user => user.name ?? (user.firstname || user.lastname ? [user.firstname, user.lastname].join(' ').trim() : null) ?? user.username)
    );
  }

}
