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
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { StatusIndicatorComponent } from '@rxap/ngx-status-check';
import { ThemeService } from '@rxap/ngx-theme';
import {
  IsThemeDensity,
  ThemeDensity,
  UserSettingsThemeService,
} from '@rxap/ngx-user';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { LogoService } from '../logo.service';
import { NavigationComponent } from '../navigation/navigation.component';
import { ReleaseInfoComponent } from '../release-info/release-info.component';
import { SidenavFooterDirective } from '../sidenav/sidenav-footer.directive';
import { SidenavComponent } from '../sidenav/sidenav.component';


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
    SidenavComponent,
    ReleaseInfoComponent,
    SidenavFooterDirective,
  ],
})
export class LayoutComponent implements OnInit, OnDestroy {

  private readonly userSettingsThemeService = inject(UserSettingsThemeService);
  private readonly themeService = inject(ThemeService);
  private readonly logoService = inject(LogoService);
  public readonly logoSrc: Signal<string> = computed(() => this.logoService.src());
  public readonly logoWidth: Signal<number> = computed(() => this.logoService.width());
  public readonly logoHeight: Signal<number> = computed(() => this.logoService.height());


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
