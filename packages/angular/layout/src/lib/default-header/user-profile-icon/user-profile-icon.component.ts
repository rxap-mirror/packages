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
