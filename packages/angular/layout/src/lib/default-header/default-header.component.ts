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
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Default Header',
  category: 'Layout',
  description: 'Default content of the application header: the projected content followed by the apps button, the settings button and the user profile icon.',
  status: 'stable',
  canvasLayout: 'stretch',
  variants: [
    { name: 'Default' },
    {
      name: 'With content',
      content: '<span style="font-size: 20px">Application title</span>',
    },
  ],
})
@Component({
    selector: 'rxap-default-header',
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultHeaderComponent {

  protected readonly layoutComponentService = inject(LayoutService);

  public readonly collapsed = computed(() => this.layoutComponentService.collapsed());
  public readonly isMobile = computed(() => this.layoutComponentService.isMobile());
  public readonly opened = computed(() => this.layoutComponentService.opened());
  public readonly profile = toSignal(inject(RXAP_USER_PROFILE_DATA_SOURCE).connect('user-profile'), { initialValue: null });

  protected readonly defaultHeaderService = inject(DefaultHeaderService);

  public readonly portals = computed(() => this.defaultHeaderService.portals());
  public readonly hasPortals = computed(() => this.portals().length > 0);

}
