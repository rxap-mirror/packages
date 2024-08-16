import {
  CdkPortalOutlet,
  ComponentPortal,
} from '@angular/cdk/portal';
import { NgIf } from '@angular/common';
import {
  Component,
  inject,
  Injector,
  isDevMode,
  runInInjectionContext,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import { IconDirective } from '@rxap/material-directives/icon';
import {
  ThemeService,
} from '@rxap/ngx-theme';
import {
  coerceArray,
  IsFunction,
  ThemeDensity,
} from '@rxap/utilities';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RXAP_SETTINGS_MENU_ITEM,
  RXAP_SETTINGS_MENU_ITEM_COMPONENT,
} from '../../tokens';
import { SettingsMenuItem } from '../../types';

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
    IconDirective,
    NgIf,
  ],
})
export class SettingsButtonComponent {

  public isDevMode = isDevMode();

  public readonly theme = inject(ThemeService);
  private readonly injector = inject(Injector);

  customItemComponents: Signal<ComponentPortal<unknown>[]> = toSignal(from(Promise.all(
    coerceArray(inject(RXAP_SETTINGS_MENU_ITEM_COMPONENT, { optional: true }))
      .map(item => IsFunction(item) ? item() : item),
  )).pipe(map(items => items.map(item => new ComponentPortal(item, null, this.injector)))), { initialValue: [] });

  customItems = signal(coerceArray(inject(RXAP_SETTINGS_MENU_ITEM, { optional: true })));

  private savePreviewDensityValue = false;
  private currentDensityValue: ThemeDensity | null = null;

  private savePreviewTypographyValue = false;
  private currentTypographyValue: string | null = null;

  public readonly availableTypographies = this.theme.getAvailableTypographies();
  private savePreviewThemeValue = false;

  public readonly availableThemes = this.theme.getAvailableThemes();
  private currentThemeValue: string | null = null;

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

  clickItem(item: SettingsMenuItem) {
    runInInjectionContext(this.injector, () => item.action());
  }
}
