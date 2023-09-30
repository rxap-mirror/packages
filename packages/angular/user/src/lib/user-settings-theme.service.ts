import {
  inject,
  Injectable,
} from '@angular/core';
import { PubSubService } from '@rxap/ngx-pub-sub';
import {
  debounceTime,
  Subscription,
  tap,
} from 'rxjs';
import { ThemeControllerGetRemoteMethod } from './openapi/remote-methods/theme-controller-get.remote-method';
import { ThemeControllerSetDensityRemoteMethod } from './openapi/remote-methods/theme-controller-set-density.remote-method';
import { ThemeControllerSetPresetRemoteMethod } from './openapi/remote-methods/theme-controller-set-preset.remote-method';
import { ThemeControllerSetTypographyRemoteMethod } from './openapi/remote-methods/theme-controller-set-typography.remote-method';
import { ThemeControllerSetRemoteMethod } from './openapi/remote-methods/theme-controller-set.remote-method';
import { ThemeControllerSetRequestBody } from './openapi/request-bodies/theme-controller-set.request-body';
import { ThemeControllerGetResponse } from './openapi/responses/theme-controller-get.response';
import { UserSettingsThemeDataSource } from './user-settings-theme.data-source';

export enum ThemeDensity {
  Normal = 0,
  Compact = -1,
  Dense = -2,
  VeryDense = -3,
}

export function IsThemeDensity(value: any): value is ThemeDensity {
  return Object.values(ThemeDensity).includes(value);
}

@Injectable({ providedIn: 'root' })
export class UserSettingsThemeService<T = unknown> {

  protected readonly getThemeMethod = inject(ThemeControllerGetRemoteMethod);
  protected readonly setThemeMethod = inject(ThemeControllerSetRemoteMethod);
  protected readonly setDensityMethod = inject(ThemeControllerSetDensityRemoteMethod);
  protected readonly setPresetMethod = inject(ThemeControllerSetPresetRemoteMethod);
  protected readonly setTypographyMethod = inject(ThemeControllerSetTypographyRemoteMethod);
  protected readonly userSettingsThemeDataSource = inject(UserSettingsThemeDataSource);
  protected readonly pubSub = inject(PubSubService);

  protected syncSubscription?: Subscription;

  async get(): Promise<ThemeControllerGetResponse<T>> {
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

  startSync() {
    if (this.syncSubscription) {
      return;
    }
    this.syncSubscription = new Subscription();
    this.syncSubscription.add(this.pubSub.subscribe('rxap.theme.density.change').pipe(
      debounceTime(1000),
      tap(async (event) => {
        if (IsThemeDensity(event.data)) {
          await this.setDensity(event.data);
        }
      }),
    ).subscribe());
    this.syncSubscription.add(this.pubSub.subscribe('rxap.theme.preset.change').pipe(
      debounceTime(1000),
      tap(async (event) => {
        if (typeof event.data === 'string') {
          await this.setPreset(event.data);
        }
      }),
    ).subscribe());
    this.syncSubscription.add(this.pubSub.subscribe('rxap.theme.typography.change').pipe(
      debounceTime(1000),
      tap(async (event) => {
        if (typeof event.data === 'string') {
          await this.setTypography(event.data);
        }
      }),
    ).subscribe());
  }

  stopSync() {
    this.syncSubscription?.unsubscribe();
  }

}
