import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LayoutService } from '../layout.service';
import { UserProfileDataSource } from '@rxap/ngx-user';
import { AppsButtonComponent } from './apps-button/apps-button.component';
import { SettingsButtonComponent } from './settings-button/settings-button.component';
import { SidenavToggleButtonComponent } from './sidenav-toggle-button/sidenav-toggle-button.component';
import { UserProfileIconComponent } from './user-profile-icon/user-profile-icon.component';

@Component({
  selector: 'rxap-default-header',
  standalone: true,
  imports: [
    AppsButtonComponent,
    SettingsButtonComponent,
    SidenavToggleButtonComponent,
    UserProfileIconComponent,
  ],
  host: {
    'class': 'grow',
  },
  templateUrl: './default-header.component.html',
  styleUrl: './default-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultHeaderComponent {

  public readonly layoutComponentService = inject(LayoutService);

  public readonly collapsable = computed(() => this.layoutComponentService.collapsable());
  public readonly opened = computed(() => this.layoutComponentService.opened());

  private readonly userProfileService: UserProfileDataSource = inject(UserProfileDataSource);
  public readonly profile = toSignal(this.userProfileService.connect('user-profile'), { initialValue: null });

}
