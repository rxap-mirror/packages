import { MediaMatcher } from '@angular/cdk/layout';
import {
  inject,
  Injectable,
  isDevMode,
  signal,
  WritableSignal,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import {
  PubSubService,
  RXAP_TOPICS,
} from '@rxap/ngx-pub-sub';
import { isDefined } from '@rxap/rxjs';
import { ThemeDensity } from '@rxap/utilities';
import {
  debounceTime,
  map,
  Subscription,
  tap,
} from 'rxjs';
import {
  ColorPalette,
  ComputeColorPalette,
} from './compute-color-palette';
import { ThemeModeService } from './theme-mode.service';

export interface ColorPaletteConfigWithName extends ColorPaletteConfig {
  name?: string;
}

export interface ThemeConfig {
  primaryColor?: ColorPaletteConfigWithName;
  accentColor?: ColorPaletteConfigWithName;
  warnColor?: ColorPaletteConfigWithName;
  density?: ThemeDensity;
  typography?: string;
}

export interface ColorPaletteConfig {
  algorithm?: string;
  base?: string;
  color?: Partial<ColorPalette>;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {

  public readonly config = inject(ConfigService);
  public readonly pubSub = inject(PubSubService);

  public readonly themeModeService = inject(ThemeModeService);

  public readonly darkMode = this.themeModeService.darkMode;
  public readonly themeName: WritableSignal<string>;
  public readonly density: WritableSignal<ThemeDensity>;
  public readonly typography: WritableSignal<string>;

  protected syncSubscription?: Subscription;

  constructor(private readonly mediaMatcher: MediaMatcher) {
    this.themeName = signal(this.getTheme());
    this.density = signal(this.getDensity());
    this.typography = signal(this.getTypography());
  }

  public restore() {
    if (isDevMode()) {
      console.log('Restore theme settings from local storage');
    }

    this.restoreThemeName();
    this.restoreDensity();
    this.restoreTypography();

    this.restoreFromPubSub();
  }

  protected restoreFromPubSub() {
    if (this.syncSubscription) {
      return;
    }
    this.syncSubscription = new Subscription();
    this.syncSubscription.add(this.pubSub.subscribe<ThemeDensity>(RXAP_TOPICS.theme.density.restore).pipe(
      debounceTime(1000),
      map(event => event.data),
      isDefined(),
      tap(data => this.setDensity(data, false, false))
    ).subscribe());
    this.syncSubscription.add(this.pubSub.subscribe<string>(RXAP_TOPICS.theme.preset.restore).pipe(
      debounceTime(1000),
      map(event => event.data),
      isDefined(),
      tap(data => this.setTheme(data, false, false))
    ).subscribe());
    this.syncSubscription.add(this.pubSub.subscribe<string>(RXAP_TOPICS.theme.typography.restore).pipe(
      debounceTime(1000),
      map(event => event.data),
      isDefined(),
      tap(data => this.setTypography(data, false, false))
    ).subscribe());
  }

  private get themeNameLocalStorageKey() {
    return (
             window as any
           )?.['__rxap__']?.['ngx']?.['theme']?.['name']?.['key'] ?? `rxap-theme-name`;
  }

  private get densityLocalStorageKey() {
    return (
             window as any
           )?.['__rxap__']?.['ngx']?.['theme']?.['density']?.['key'] ?? `rxap-theme-density`;
  }

  private get typographyLocalStorageKey() {
    return (
             window as any
           )?.['__rxap__']?.['ngx']?.['theme']?.['typography']?.['key'] ?? `rxap-theme-typography`;
  }

  // region restore

  public restoreThemeName() {
    const themeName = localStorage.getItem(this.themeNameLocalStorageKey);
    if (themeName) {
      this.setTheme(themeName, true);
    }
    return themeName;
  }

  public restoreTypography() {
    const typography = localStorage.getItem(this.typographyLocalStorageKey);
    if (typography) {
      this.setTypography(typography, true);
    }
    return typography;
  }

  public restoreDensity() {
    const density = localStorage.getItem('rxap-theme-density');
    if (density) {
      const value = Number(density) as ThemeDensity;
      if (value <= 0 && value >= -3) {
        this.setDensity(Number(density) as ThemeDensity, true);
        return value;
      }
    }
    return null;
  }

  // endregion

  public toggleDarkTheme(): void {
    this.themeModeService.toggleTheme();
  }

  // region set theme configuration state

  public setDarkTheme(darkMode: boolean, silent = false, publish = true): void {
    this.themeModeService.setTheme(darkMode ? 'dark' : 'light', publish);
  }

  public setDensity(density: ThemeDensity, silent = false, publish = true): void {
    this.applyDensity(density);
    if (this.density() !== density) {
      this.density.set(density);
      if (!silent) {
        localStorage.setItem(this.densityLocalStorageKey, String(density));
        if (publish) {
          this.pubSub.publish(RXAP_TOPICS.theme.density.changed, density);
        }
      }
    }
  }

  public setTypography(typography: string, silent = false, publish = true): void {
    this.applyTypography(typography);
    if (this.typography() !== typography) {
      this.typography.set(typography);
      if (!silent) {
        localStorage.setItem(this.typographyLocalStorageKey, typography);
        if (publish) {
          this.pubSub.publish(RXAP_TOPICS.theme.typography.changed, typography);
        }
      }
    }
  }

  public setTheme(themeName: string, silent = false, publish = true) {
    this.applyTheme(themeName);
    this.density.set(this.getDensity());
    this.typography.set(this.getTypography());
    if (this.themeName() !== themeName) {
      this.themeName.set(themeName);
      if (!silent) {
        localStorage.setItem(this.themeNameLocalStorageKey, themeName);
        if (publish) {
          this.pubSub.publish(RXAP_TOPICS.theme.preset.changed, themeName);
        }
      }
    }
  }

  // endregion

  // region apply theme configuration state

  public applyDensity(density: ThemeDensity): void {
    document.body.classList.remove('density-0', 'density-1', 'density-2', 'density-3');
    if (density < 0) {
      document.body.classList.add(`density${ density }`);
    }
  }

  public applyTypography(typography: string): void {
    document.body.style.setProperty('--font-family', `var(--font-family-${ typography })`);
  }

  public applyTheme(themeName: string): void {
    if (themeName === 'default') {
      this.resetToDefaultTheme();
      return;
    }

    const theme = this.getThemeConfig(themeName);

    if (theme.primaryColor?.color) {
      this.setCssColorVariables('primary', theme.primaryColor.color);
    }

    if (theme.accentColor?.color) {
      this.setCssColorVariables('accent', theme.accentColor.color);
    }

    if (theme.warnColor?.color) {
      this.setCssColorVariables('warn', theme.warnColor.color);
    }

    if (theme.density !== undefined) {
      this.applyDensity(theme.density);
    }

    if (theme.typography) {
      this.applyTypography(theme.typography);
    }

    document.body.style.setProperty(`--theme-name`, themeName);
  }

  // endregion

  // region get theme configuration state

  public getDensity(): ThemeDensity {
    let density = 0;
    document.body.classList.forEach((className) => {
      const match = className.match(/density-([123])/);
      if (match) {
        density = Number(match[1]) * -1;
      }
    });
    return density as ThemeDensity;
  }

  public getTypography(): string {
    const variable = document.body.style.getPropertyValue('--font-family');
    const match = variable.match(/var\(--font-family-(.*)\)/);
    if (match) {
      return match[1];
    }
    return 'default';
  }

  public getTheme() {
    return document.body.style.getPropertyValue('--theme-name') || 'default';
  }

  // endregion

  // region get available

  public getAvailableColorPalettes(): string[] | null {
    const colorPalettesConfigs: Record<string, unknown> | boolean = this.config.get('colorPalettes', false);
    if (!colorPalettesConfigs) {
      return null;
    }
    const availableColorPalettes: string[] = Object.keys(colorPalettesConfigs);
    availableColorPalettes.unshift('default');
    return availableColorPalettes;
  }

  public getAvailableThemes(): string[] | null {
    const themeConfigs: Record<string, unknown> | boolean = this.config.get('themes', false);
    if (!themeConfigs) {
      return null;
    }
    const availableThemes: string[] = Object.keys(themeConfigs);
    availableThemes.unshift('default');
    return availableThemes;
  }

  public getAvailableTypographies(): string[] | null {
    const availableTypographies = this.config.get('typographies', false);
    if (!availableTypographies) {
      return null;
    }
    return Array
      .from(document.styleSheets)
      .filter(sheet => sheet.href === null || sheet.href.startsWith(window.location.origin))
      .flatMap(sheet => Array.from(sheet.cssRules || []))
      .filter((rule: any) => rule.selectorText === ':root')
      .flatMap((rule: any) => Array.from(rule.style))
      .filter((prop: any) => prop.startsWith('--'))
      .filter((prop: any) => prop.startsWith('--font-family-'))
      .map((prop: any) => prop.replace('--font-family-', ''))
      .sort();
  }

  // endregion

  public getColorPalette(colorPaletteName: string): Partial<ColorPalette> {
    const colorPaletteConfig = this.config.getOrThrow<ColorPaletteConfig>(`colorPalettes.${ colorPaletteName }`);
    return this.coerceColorPalette(colorPaletteConfig);
  }

  // region utility

  private coerceColorPalette(colorPaletteConfig: ColorPaletteConfig): Partial<ColorPalette> {
    let colorPalette: Partial<ColorPalette> = {};

    if (colorPaletteConfig.color) {
      if (Object.keys(colorPaletteConfig.color).length !== 14) {
        // the color palette is not complete
        if (colorPaletteConfig.base) {
          colorPalette =
            ComputeColorPalette(colorPaletteConfig.base, colorPaletteConfig.color, colorPaletteConfig.algorithm);
        }
      }
      colorPalette = colorPaletteConfig.color;
    } else if (colorPaletteConfig.base) {
      colorPalette = ComputeColorPalette(colorPaletteConfig.base, {}, colorPaletteConfig.algorithm);
    }

    if (Object.keys(colorPalette).length === 0) {
      throw new Error('FATAL: The color palette has neither a base nor a color property');
    }

    return colorPalette;
  }

  private getThemeConfig(themeName: string): ThemeConfig {
    const themeConfig = this.config.getOrThrow<ThemeConfig>(`themes.${ themeName }`);

    if (themeConfig.accentColor) {
      themeConfig.accentColor.color = this.coerceColorPalette(themeConfig.accentColor);
    }

    if (themeConfig.primaryColor) {
      themeConfig.primaryColor.color = this.coerceColorPalette(themeConfig.primaryColor);
    }

    if (themeConfig.warnColor) {
      themeConfig.warnColor.color = this.coerceColorPalette(themeConfig.warnColor);
    }

    return themeConfig;
  }

  private setCssColorVariables(name: string, colorPalette: Partial<ColorPalette>): void {
    this.clearCssColorVariables(name);
    for (const [ index, color ] of Object.entries(colorPalette)) {
      document.body.style.setProperty(`--${ name }-${ index }`, color);
    }
  }

  private clearCssColorVariables(name: string): void {
    document.body.style.removeProperty(`--${ name }-50`);
    for (let index = 100; index <= 900; index += 100) {
      document.body.style.removeProperty(`--${ name }-${ index }`);
    }
    document.body.style.removeProperty(`--${ name }-a100`);
    document.body.style.removeProperty(`--${ name }-a200`);
    document.body.style.removeProperty(`--${ name }-a400`);
    document.body.style.removeProperty(`--${ name }-a700`);
  }

  private resetToDefaultTheme() {
    this.clearCssColorVariables('primary');
    this.clearCssColorVariables('accent');
    this.clearCssColorVariables('warn');
    this.setDensity(0);
    this.setTypography('default');
    document.body.style.removeProperty(`--theme-name`);
    localStorage.removeItem(this.themeNameLocalStorageKey);
    localStorage.removeItem(this.densityLocalStorageKey);
    localStorage.removeItem(this.typographyLocalStorageKey);
  }

  // endregion

}
