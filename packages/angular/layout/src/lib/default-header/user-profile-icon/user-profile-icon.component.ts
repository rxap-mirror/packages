import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  PubSubService,
  RXAP_TOPICS,
} from '@rxap/ngx-pub-sub';
import { EXTRACT_USERNAME_FROM_PROFILE } from '../../tokens';
import { ExtractUsernameFromProfileFn } from '../../types';
import { Showcase } from '@ng-prism/core';

@Showcase<UserProfileIconComponent>({
  title: 'User Profile Icon',
  category: 'Layout',
  description: 'Account icon that opens a menu with the name of the user and the logout action. The name is extracted from the profile with the `EXTRACT_USERNAME_FROM_PROFILE` function.',
  status: 'stable',
  variants: [
    {
      name: 'Display name',
      inputs: { profile: { displayName: 'Jane Doe' } },
    },
    {
      name: 'Email only',
      inputs: { profile: { email: 'jane.doe@example.com' } },
    },
    {
      name: 'Without name',
      inputs: { profile: {} },
      description: 'The menu only contains the logout action.',
    },
  ],
})
@Component({
    selector: 'rxap-user-profile-icon',
    templateUrl: './user-profile-icon.component.html',
    styleUrls: ['./user-profile-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatMenuModule,
        MatIconModule,
    ]
})
export class UserProfileIconComponent {

  protected readonly extractUsernameFromProfile: ExtractUsernameFromProfileFn = inject(EXTRACT_USERNAME_FROM_PROFILE);
  protected readonly pubSubService = inject(PubSubService);

  public readonly profile = input.required();

  public readonly username = computed(() => {
    const profile = this.profile();
    if (profile) {
      return this.extractUsernameFromProfile(profile);
    }
    return null;
  });

  public logout() {
    this.pubSubService.publish(RXAP_TOPICS.authentication.logout);
  }


}
