import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  Optional,
  Signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatOptionModule,
  ThemePalette,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DataSourceCollectionDirective } from '@rxap/data-source/directive';
import { StopPropagationDirective } from '@rxap/directives';
import { HeaderService } from '@rxap/services';
import { LayoutComponentService } from '../layout/layout.component.service';
import { RXAP_HEADER_COMPONENT } from '../tokens';
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
    MatToolbarModule,
    NgClass,
    NgIf,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    StopPropagationDirective,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    DataSourceCollectionDirective,
    MatSlideToggleModule,
    AsyncPipe,
    NavigationProgressBarComponent,
    UserProfileIconComponent,
    AppsButtonComponent,
    SettingsButtonComponent,
    SidenavToggleButtonComponent,
  ],
})
export class HeaderComponent {

  @Input()
  public color: ThemePalette = undefined;

  public readonly collapsable: Signal<boolean>;
  public readonly opened: Signal<boolean>;

  constructor(
    @Inject(HeaderService)
    public readonly headerComponentService: HeaderService,
    public readonly layoutComponentService: LayoutComponentService,
    @Optional() @Inject(RXAP_HEADER_COMPONENT) public headerComponent: any,
  ) {
    this.collapsable = layoutComponentService.collapsable;
    this.opened = layoutComponentService.opened;
  }

}
