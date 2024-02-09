import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgOptimizedImage,
  NgStyle,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  OnDestroy,
  OnInit,
  Signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatDrawerMode,
  MatSidenav,
  MatSidenavModule,
} from '@angular/material/sidenav';
import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import {
  DetermineReleaseName,
  Environment,
  RXAP_ENVIRONMENT,
} from '@rxap/environment';
import { IconLoaderService } from '@rxap/icon';
import { StatusIndicatorComponent } from '@rxap/ngx-status-check';
import { ThemeService } from '@rxap/ngx-theme';
import {
  IsThemeDensity,
  ThemeDensity,
  UserSettingsThemeService,
} from '@rxap/ngx-user';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { LayoutComponentService } from './layout.component.service';


@Component({
  selector: 'rxap-layout',
  templateUrl: './layout.component.html',
  styleUrls: [ './layout.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    HeaderComponent,
    MatSidenavModule,
    AsyncPipe,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    NgIf,
    FooterComponent,
    MatMenuModule,
    NgOptimizedImage,
    NavigationComponent,
    RouterOutlet,
    StatusIndicatorComponent,
    NgStyle,
    NgClass,
  ],
})
export class LayoutComponent implements OnInit, OnDestroy {

  public readonly sidenavMode: Signal<MatDrawerMode>;
  public readonly fixedBottomGap: Signal<number>;
  public readonly fixedTopGap: Signal<number>;
  public readonly pinned: Signal<boolean>;
  public readonly collapsable: Signal<boolean>;
  public readonly logoSrc: string;
  public readonly logoWidth: number;
  public readonly release: string;
  public readonly opened: Signal<boolean>;

  @ViewChild(MatSidenav, { static: true }) public sidenav!: MatSidenav;

  private readonly userSettingsThemeService = inject(UserSettingsThemeService);
  private readonly themeService = inject(ThemeService);

  constructor(
    public readonly layoutComponentService: LayoutComponentService,
    @Inject(RXAP_ENVIRONMENT)
    private readonly environment: Environment,
    iconLoaderService: IconLoaderService,
  ) {
    iconLoaderService.load();
    this.fixedBottomGap = layoutComponentService.fixedBottomGap;
    this.fixedTopGap = layoutComponentService.fixedTopGap;
    this.pinned = layoutComponentService.pinned;
    this.collapsable = layoutComponentService.collapsable;
    this.opened = layoutComponentService.opened;
    this.sidenavMode = layoutComponentService.mode;
    this.logoSrc = this.layoutComponentService.logo.src ?? 'https://via.placeholder.com/256x128px';
    this.logoWidth = this.layoutComponentService.logo.width ?? 256;
    this.release = DetermineReleaseName(this.environment);
  }

  ngOnDestroy() {
    this.userSettingsThemeService.stopSync();
  }

  ngOnInit() {
    this.userSettingsThemeService.startSync();
    this.userSettingsThemeService.get().then(theme => {
      if (theme.preset && theme.preset !== 'default') {
        this.themeService.setTheme(theme.preset, true);
      }
      if (theme.density && IsThemeDensity(theme.density) && theme.density !== ThemeDensity.Normal) {
        this.themeService.setDensity(theme.density, true);
      }
      if (theme.typography && theme.typography !== 'default') {
        this.themeService.setTypography(theme.typography, true);
      }
    });
  }

}
