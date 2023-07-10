import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  Optional,
  Inject,
} from '@angular/core';
import {Constructor} from '@rxap/utilities';
import {
  Subscription,
  Observable,
} from 'rxjs';
import {
  tap,
  map,
} from 'rxjs/operators';
import {MatSidenav} from '@angular/material/sidenav';
import {UserService} from '@rxap/authentication';
import {RXAP_HEADER_COMPONENT} from '../tokens';
import {HeaderService} from '@rxap/services';
import {
  MatMenuPanel,
  MatMenuModule,
} from '@angular/material/menu';
import {ThemePalette} from '@angular/material/core';
import {NavigationProgressBarComponent} from './navigation-progress-bar/navigation-progress-bar.component';
import {SignOutComponent} from './sign-out/sign-out.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {UserProfileIconComponent} from './user-profile-icon/user-profile-icon.component';
import {AppsButtonComponent} from './apps-button/apps-button.component';
import {LanguageSelectorComponent} from './language-selector/language-selector.component';
import {SidenavToggleButtonComponent} from './sidenav-toggle-button/sidenav-toggle-button.component';
import {FlexModule} from '@angular/flex-layout/flex';
import {
  NgClass,
  NgFor,
  NgComponentOutlet,
  NgIf,
  AsyncPipe,
} from '@angular/common';
import {ExtendedModule} from '@angular/flex-layout/extended';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'rxap-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatToolbarModule,
    ExtendedModule,
    NgClass,
    NgFor,
    NgComponentOutlet,
    FlexModule,
    NgIf,
    SidenavToggleButtonComponent,
    LanguageSelectorComponent,
    AppsButtonComponent,
    UserProfileIconComponent,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    SignOutComponent,
    NavigationProgressBarComponent,
    AsyncPipe,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input()
  public sidenav?: MatSidenav;

  public components: Array<Constructor<any>> = [];

  public subscriptions = new Subscription();

  public hasUser$: Observable<boolean>;

  @Input()
  public color: ThemePalette = 'primary';

  @Input()
  public settingsMenuPanel?: MatMenuPanel;

  constructor(
    @Inject(HeaderService)
    public readonly headerComponentService: HeaderService,
    @Inject(UserService)
    private readonly userService: UserService<any>,
    @Optional() @Inject(RXAP_HEADER_COMPONENT) public headerComponent: any,
  ) {
    this.hasUser$ = this.userService.user$.pipe(map(Boolean));
  }

  public ngOnInit() {
    this.updateComponents();
    this.subscriptions.add(
      this.headerComponentService.update$
        .pipe(tap(() => this.updateComponents()))
        .subscribe(),
    );
  }

  public updateComponents(): void {
    this.components = this.headerComponentService.getComponents();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
