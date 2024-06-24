import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemePalette } from '@angular/material/core';
import { MatToolbar } from '@angular/material/toolbar';
import { UserProfileDataSource } from '@rxap/ngx-user';
import { LayoutService } from '../layout.service';
import { AppsButtonComponent } from './apps-button/apps-button.component';
import { NavigationProgressBarComponent } from './navigation-progress-bar/navigation-progress-bar.component';
import { SettingsButtonComponent } from './settings-button/settings-button.component';
import { SidenavToggleButtonComponent } from './sidenav-toggle-button/sidenav-toggle-button.component';
import { UserProfileIconComponent } from './user-profile-icon/user-profile-icon.component';

@Component({
  selector: 'rxap-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatToolbar,
    SidenavToggleButtonComponent,
    AppsButtonComponent,
    SettingsButtonComponent,
    UserProfileIconComponent,
    NavigationProgressBarComponent,
  ],
})
export class HeaderComponent {

  public readonly color = input<ThemePalette>();

  public readonly layoutComponentService = inject(LayoutService);

  public readonly collapsable = computed(() => this.layoutComponentService.collapsable());
  public readonly opened = computed(() => this.layoutComponentService.opened());

  private readonly userProfileService: UserProfileDataSource = inject(UserProfileDataSource);
  public readonly profile = toSignal(this.userProfileService.connect('user-profile'), { initialValue: null });

  public readonly hasProfile = computed(() => !!this.profile());

}
