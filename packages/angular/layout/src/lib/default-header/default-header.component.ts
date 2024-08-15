import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatToolbarRow } from '@angular/material/toolbar';
import { HeaderService } from '../header.service';
import { LayoutService } from '../layout.service';
import { RXAP_USER_PROFILE_DATA_SOURCE } from '../tokens';
import { AppsButtonComponent } from './apps-button/apps-button.component';
import { DefaultHeaderService } from './default-header.service';
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
    MatToolbarRow,
    CdkPortalOutlet,
  ],
  host: {
    'class': 'grow',
  },
  templateUrl: './default-header.component.html',
  styleUrl: './default-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultHeaderComponent {

  private readonly layoutComponentService = inject(LayoutService);

  public readonly collapsable = computed(() => this.layoutComponentService.collapsable());
  public readonly opened = computed(() => this.layoutComponentService.opened());
  public readonly profile = toSignal(inject(RXAP_USER_PROFILE_DATA_SOURCE).connect('user-profile'), { initialValue: null });

  private readonly defaultHeaderService = inject(DefaultHeaderService);

  public readonly portals = computed(() => this.defaultHeaderService.portals());
  public readonly hasPortals = computed(() => this.portals().length > 0);

}
