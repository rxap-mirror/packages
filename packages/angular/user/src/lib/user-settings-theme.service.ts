import {
  inject,
  Injectable,
} from '@angular/core';
import { ThemeControllerGetRemoteMethod } from './openapi/remote-methods/theme-controller-get.remote-method';
import { ThemeControllerSetDensityRemoteMethod } from './openapi/remote-methods/theme-controller-set-density.remote-method';
import { ThemeControllerSetPresetRemoteMethod } from './openapi/remote-methods/theme-controller-set-preset.remote-method';
import { ThemeControllerSetTypographyRemoteMethod } from './openapi/remote-methods/theme-controller-set-typography.remote-method';
import { ThemeControllerSetRemoteMethod } from './openapi/remote-methods/theme-controller-set.remote-method';
import { ThemeControllerSetRequestBody } from './openapi/request-bodies/theme-controller-set.request-body';
import { UserSettingsThemeDataSource } from './user-settings-theme.data-source';

export enum ThemeDensity {
  Normal = 0,
  Compact = -1,
  Dense = -2,
  VeryDense = -3,
}

@Injectable({ providedIn: 'root' })
export class UserSettingsLanguageService<T = unknown> {

  protected readonly getThemeMethod = inject(ThemeControllerGetRemoteMethod);
  protected readonly setThemeMethod = inject(ThemeControllerSetRemoteMethod);
  protected readonly setDensityMethod = inject(ThemeControllerSetDensityRemoteMethod);
  protected readonly setPresetMethod = inject(ThemeControllerSetPresetRemoteMethod);
  protected readonly setTypographyMethod = inject(ThemeControllerSetTypographyRemoteMethod);
  protected readonly userSettingsThemeDataSource = inject(UserSettingsThemeDataSource);

  async get() {
    return this.getThemeMethod.call();
  }

  async set(themeSettings: ThemeControllerSetRequestBody<T>) {
    await this.setThemeMethod.call({ requestBody: themeSettings });
    this.userSettingsThemeDataSource.refresh();
  }

  async setDensity(density: ThemeDensity) {
    await this.setDensityMethod.call({ requestBody: { value: density } });
    this.userSettingsThemeDataSource.refresh();
  }

  async setPreset(preset: string) {
    await this.setPresetMethod.call({ requestBody: { value: preset } });
    this.userSettingsThemeDataSource.refresh();
  }

  async setTypography(typography: string) {
    await this.setTypographyMethod.call({ requestBody: { value: typography } });
    this.userSettingsThemeDataSource.refresh();
  }

}
