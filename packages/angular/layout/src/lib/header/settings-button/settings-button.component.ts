import {
  CdkPortalOutlet,
  ComponentPortal,
  ComponentType,
} from '@angular/cdk/portal';
import {
  Component,
  inject,
  Injector,
  isDevMode,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import {
  ActivatedRoute,
  Data,
} from '@angular/router';
import { ChangelogService } from '@rxap/ngx-changelog';
import {
  ThemeDensity,
  ThemeService,
} from '@rxap/ngx-theme';
import { map } from 'rxjs/operators';

@Component({
  selector: 'rxap-settings-button',
  standalone: true,
  templateUrl: './settings-button.component.html',
  styleUrls: [ './settings-button.component.scss' ],
  imports: [
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    CdkPortalOutlet,
  ],
})
export class SettingsButtonComponent {

  public isDevMode = isDevMode();

  public readonly theme = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly changelogService = inject(ChangelogService);

  items: Signal<Array<ComponentPortal<unknown>>> = toSignal(this.route.data.pipe(
    map(data => this.getCustomMenuItems(data)),
    map(items => items.map(item => new ComponentPortal(item, undefined, this.injector))),
  ), { initialValue: [] });

  private savePreviewDensityValue = false;
  private currentDensityValue: ThemeDensity | null = null;

  private savePreviewTypographyValue = false;
  private currentTypographyValue: string | null = null;

  public readonly availableTypographies = this.theme.getAvailableTypographies();
  private savePreviewThemeValue = false;

  public readonly availableThemes = this.theme.getAvailableThemes();
  private currentThemeValue: string | null = null;

  private getCustomMenuItems(data: Data): Array<ComponentType<unknown>> {
    if (data?.['layout']?.header?.menu?.items?.length) {
      return data['layout'].header.menu.items;
    }
    return [];
  }

  openChangelogDialog() {
    this.changelogService.showChangelogDialog();
  }

  previewDensity(density: ThemeDensity) {
    this.theme.applyDensity(density);
  }

  restoreDensity() {
    this.theme.applyDensity(this.theme.density());
  }

  setDensity(density: ThemeDensity) {
    this.theme.setDensity(density);
  }

  previewTypography(typography: string) {
    this.theme.applyTypography(typography);
  }

  restoreTypography() {
    this.theme.applyTypography(this.theme.typography());
  }

  setTypography(typography: string) {
    this.theme.setTypography(typography);
  }

  previewTheme(theme: string) {
    this.theme.applyTheme(theme);
  }

  restoreTheme() {
    this.theme.applyTheme(this.theme.themeName());
  }

  setTheme(theme: string) {
    this.theme.setTheme(theme);
  }

}
