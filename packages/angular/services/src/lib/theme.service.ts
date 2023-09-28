import { MediaMatcher } from '@angular/cdk/layout';
import {
  inject,
  Injectable,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import { BehaviorSubject } from 'rxjs';
import {
  ColorPalette,
  ComputeColorPalette,
} from './compute-color-palette';

export type ThemeDensity = 0 | -1 | -2 | -3;

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

  public readonly darkMode$: BehaviorSubject<boolean>;

  constructor(mediaMatcher: MediaMatcher) {
    const darkModeCached = localStorage.getItem('rxap-dark-mode');
    const darkModeMediaQuery = mediaMatcher.matchMedia('(prefers-color-scheme: dark)');
    let darkMode: boolean | null = null;
    if (darkModeCached === 'true') {
      darkMode = true;
    }
    if (darkModeCached === 'false') {
      darkMode = false;
    }
    if (darkMode === null) {
      darkMode = darkModeMediaQuery.matches;
    }
    darkModeMediaQuery.addEventListener('change', (event) => {
      this.toggleDarkTheme(event.matches);
    });
    // this.darkMode$ must be first bc the this.darkMode getter is used in this.toggleDarkTheme method
    this.darkMode$ = new BehaviorSubject<boolean>(darkMode);
    this.toggleDarkTheme(this.darkMode);
  }

  public get darkMode() {
    return this.darkMode$.value;
  }

  public toggleDarkTheme(checked = !this.darkMode): void {
    if (checked) {
      document.body.classList.add('dark-theme');
      document.body.classList.add('dark');
      localStorage.removeItem('rxap-light-theme');
      localStorage.setItem('rxap-dark-mode', 'true');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.remove('dark');
      localStorage.setItem('rxap-light-theme', 'true');
      localStorage.setItem('rxap-dark-mode', 'false');
    }
    if (checked !== this.darkMode$.value) {
      this.darkMode$.next(checked);
    }
  }

  public setDensity(density: ThemeDensity): void {
    document.body.classList.remove('density-0', 'density-1', 'density-2', 'density-3');
    if (density < 0) {
      document.body.classList.add(`density${ density }`);
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

  public setTypography(typography?: string): void {
    const classRemoveList: string[] = [];
    document.body.classList.forEach((className) => {
      const match = className.match(/typography-/);
      if (match) {
        classRemoveList.push(className);
      }
    });
    document.body.classList.remove(...classRemoveList);
    if (typography) {
      document.body.classList.add(`typography-${ typography }`);
    }
  }

  public getTypography(): string | null {
    let typography: string | null = null;
    document.body.classList.forEach((className) => {
      const match = className.match(/typography-(.*)/);
      if (match) {
        typography = match[1];
      }
    });
    return typography;
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

  }

  getCurrentTheme() {
    return document.body.style.getPropertyValue('--theme-name') ?? 'default';
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

  private resetToDefaultTheme() {
    this.clearCssColorVariables('primary');
    this.clearCssColorVariables('accent');
    this.clearCssColorVariables('warn');
    this.setDensity(0);
    this.setTypography();
    document.body.style.removeProperty(`--theme-name`);
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
}
