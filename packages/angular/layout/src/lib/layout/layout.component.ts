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
  computed,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  viewChild,
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
  RXAP_ENVIRONMENT,
} from '@rxap/environment';
import { StatusIndicatorComponent } from '@rxap/ngx-status-check';
import { ThemeService } from '@rxap/ngx-theme';
import {
  IsThemeDensity,
  ThemeDensity,
  UserSettingsThemeService,
} from '@rxap/ngx-user';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { LayoutService } from '../layout.service';
import { LogoService } from '../logo.service';
import { NavigationComponent } from '../navigation/navigation.component';


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

  private readonly userSettingsThemeService = inject(UserSettingsThemeService);
  private readonly themeService = inject(ThemeService);
  private readonly logoService = inject(LogoService);
  private readonly layoutService = inject(LayoutService);
  private readonly environment = inject(RXAP_ENVIRONMENT);
  private readonly sidenav = viewChild(MatSidenav);

  public readonly sidenavMode: Signal<MatDrawerMode> = computed(() => this.layoutService.mode());
  public readonly fixedBottomGap: Signal<number> = computed(() => this.layoutService.fixedBottomGap());
  public readonly fixedTopGap: Signal<number> = computed(() => this.layoutService.fixedTopGap());
  public readonly fixedInViewport: Signal<boolean> = computed(() => this.layoutService.fixedInViewport());
  public readonly pinned: Signal<boolean> = computed(() => this.layoutService.pinned());
  public readonly collapsable: Signal<boolean> = computed(() => this.layoutService.collapsable());
  public readonly logoSrc: Signal<string> = computed(() => this.logoService.src());
  public readonly logoWidth: Signal<number> = computed(() => this.logoService.width());
  public readonly release = DetermineReleaseName(this.environment);
  public readonly opened: Signal<boolean> = computed(() => this.layoutService.opened());

  togglePinned() {
    this.layoutService.togglePinned();
  }

  openSidenav() {
    this.sidenav()?.open();
  }

  closeSidenav() {
    this.sidenav()?.close();
  }

  ngOnDestroy() {
    this.userSettingsThemeService.stopSync();
  }

  ngOnInit() {
    this.userSettingsThemeService.startSync().then(() => {
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
    });
  }

}
