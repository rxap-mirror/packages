import { MediaMatcher } from '@angular/cdk/layout';
import {
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import { PubSubService } from '@rxap/ngx-pub-sub';
import {
  ColorPalette,
  ComputeColorPalette,
} from './compute-color-palette';

export enum ThemeDensity {
  Normal = 0,
  Compact = -1,
  Dense = -2,
  VeryDense = -3,
}

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

  public readonly darkMode: WritableSignal<boolean>;
  public readonly themeName: WritableSignal<string>;
  public readonly density: WritableSignal<ThemeDensity>;
  public readonly typography: WritableSignal<string>;

  constructor(mediaMatcher: MediaMatcher) {
    const darkModeMediaQuery = mediaMatcher.matchMedia('(prefers-color-scheme: dark)');

    this.darkMode = signal(darkModeMediaQuery.matches);
    this.themeName = signal(this.getCurrentTheme());
    this.density = signal(this.getDensity());
    this.typography = signal(this.getTypography());

    // region restore dark mode
    let darkMode = this.restoreDarkMode();
    // if the dark/light mode is not restored from the local storage
    if (darkMode === null) {
      // set the dark mode based on the media query
      darkMode = darkModeMediaQuery.matches;
      this.setDarkTheme(darkMode, true);
    }
    darkModeMediaQuery.addEventListener('change', (event) => {
      this.setDarkTheme(event.matches, true);
    });
    // endregion

    this.restoreThemeName();
    this.restoreDensity();
    this.restoreTypography();
  }

  private get darkModeLocalStorageKey() {
    return (
             window as any
           )?.['__rxap__']?.['ngx']?.['theme']?.['darkMode']?.['key'] ?? `rxap-dark-mode`;
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

  public restoreDarkMode() {
    let darkMode: boolean | null = null;
    const darkModeCached = localStorage.getItem(this.darkModeLocalStorageKey);
    if (darkModeCached === 'true') {
      darkMode = true;
    }
    if (darkModeCached === 'false') {
      darkMode = false;
    }
    if (darkMode !== null) {
      this.setDarkTheme(darkMode);
    }
    return darkMode;
  }

  public restoreThemeName() {
    const themeName = localStorage.getItem(this.themeNameLocalStorageKey);
    if (themeName) {
      this.setTheme(themeName);
    }
    return themeName;
  }

  public restoreTypography() {
    const typography = localStorage.getItem(this.typographyLocalStorageKey);
    if (typography) {
      this.setTypography(typography);
    }
    return typography;
  }

  public restoreDensity() {
    const density = localStorage.getItem('rxap-theme-density');
    if (density) {
      const value = Number(density) as ThemeDensity;
      if (value <= 0 && value >= -3) {
        this.setDensity(Number(density) as ThemeDensity);
        return value;
      }
    }
    return null;
  }

  public toggleDarkTheme(): void {
    this.setDarkTheme(!this.darkMode());
  }

  public setDarkTheme(darkMode: boolean, skipLocalStorage?: boolean): void {
    if (darkMode) {
      // region deprecated
      document.body.classList.add('dark-theme');
      localStorage.removeItem('rxap-light-theme');
      // endregion
      document.body.classList.add('dark');
    } else {
      // region deprecated
      document.body.classList.remove('dark-theme');
      localStorage.setItem('rxap-light-theme', 'true');
      // endregion
      document.body.classList.remove('dark');
    }
    if (this.darkMode() !== darkMode) {
      this.darkMode.set(darkMode);
      if (!skipLocalStorage) {
        localStorage.setItem(this.darkModeLocalStorageKey, String(darkMode));
      }
      this.pubSub.publish('rxap.theme.darkMode.change', darkMode);
    }
  }

  public setDensity(density: ThemeDensity): void {
    document.body.classList.remove('density-0', 'density-1', 'density-2', 'density-3');
    if (density < 0) {
      document.body.classList.add(`density${ density }`);
    }
    if (this.density() !== density) {
      this.density.set(density);
      localStorage.setItem(this.densityLocalStorageKey, String(density));
      this.pubSub.publish('rxap.theme.density.change', density);
    }
  }

  public setTypography(typography: string): void {
    document.body.style.setProperty('--font-family', `var(--font-family-${ typography })`);
    if (this.typography() !== typography) {
      this.typography.set(typography);
      localStorage.setItem(this.typographyLocalStorageKey, typography);
      this.pubSub.publish('rxap.theme.typography.change', typography);
    }
  }

  public setTheme(themeName: string) {

    if (themeName === 'default') {
      this.resetToDefaultTheme();
      return;
    }

    const theme = this.getTheme(themeName);

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
      this.setDensity(theme.density);
    }

    if (theme.typography) {
      this.setTypography(theme.typography);
    }

    document.body.style.setProperty(`--theme-name`, themeName);
    if (this.themeName() !== themeName) {
      this.themeName.set(themeName);
      localStorage.setItem(this.themeNameLocalStorageKey, themeName);
      this.pubSub.publish('rxap.theme.name.change', themeName);
    }
  }

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

  public getAvailableColorPalettes(): string[] {
    const colorPalettesConfigs: Record<string, unknown> = this.config.get('colorPalettes', {});
    const availableColorPalettes: string[] = Object.keys(colorPalettesConfigs);
    availableColorPalettes.unshift('default');
    return availableColorPalettes;
  }

  public getColorPalette(colorPaletteName: string): Partial<ColorPalette> {
    const colorPaletteConfig = this.config.getOrThrow<ColorPaletteConfig>(`colorPalettes.${ colorPaletteName }`);
    return this.coerceColorPalette(colorPaletteConfig);
  }

  public getAvailableThemes(): string[] {
    const themeConfigs: Record<string, unknown> = this.config.get('themes', {});
    const availableThemes: string[] = Object.keys(themeConfigs);
    availableThemes.unshift('default');
    return availableThemes;
  }

  getCurrentTheme() {
    return document.body.style.getPropertyValue('--theme-name') || 'default';
  }

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

  private getTheme(themeName: string): ThemeConfig {
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

  getAvailableTypographies() {
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
}
