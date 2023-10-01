import {
  inject,
  Injectable,
} from '@angular/core';
import {
  DarkModeControllerDisableRemoteMethod,
  DarkModeControllerEnableRemoteMethod,
  DarkModeControllerGetRemoteMethod,
  DarkModeControllerToggleRemoteMethod,
  UserSettingsDarkModeDataSource,
} from '@rxap/ngx-user';
import { BaseUserSettingsService } from './base-user-settings.service';
import { UserSettingsOfflineService } from './user-settings-offline.service';

@Injectable({ providedIn: 'root' })
export class UserSettingsDarkModeService extends BaseUserSettingsService {

  protected readonly getUserSettingsDarkModeMethod = inject(DarkModeControllerGetRemoteMethod);
  protected readonly toggleUserSettingsDarkModeMethod = inject(DarkModeControllerToggleRemoteMethod);
  protected readonly disableUserSettingsDarkModeMethod = inject(DarkModeControllerDisableRemoteMethod);
  protected readonly enableUserSettingsDarkModeMethod = inject(DarkModeControllerEnableRemoteMethod);
  protected readonly userSettingsDarkModeDataSource = inject(UserSettingsDarkModeDataSource);

  protected readonly offline = inject(UserSettingsOfflineService);

  async getDarkMode(): Promise<boolean> {
    if (!await this.waitUntilAuthenticated()) {
      return this.offline.get().darkMode;
    }
    return this.getUserSettingsDarkModeMethod.call();
  }

  async toggleDarkMode(): Promise<void> {
    if (!await this.waitUntilAuthenticated()) {
      const settings = this.offline.get();
      settings.darkMode = !settings.darkMode;
      this.offline.set(settings);
    } else {
      await this.toggleUserSettingsDarkModeMethod.call();
    }
    this.userSettingsDarkModeDataSource.refresh();

  }

  async disableDarkMode(): Promise<void> {
    if (!await this.waitUntilAuthenticated()) {
      const settings = this.offline.get();
      settings.darkMode = false;
      this.offline.set(settings);
    } else {
      await this.disableUserSettingsDarkModeMethod.call();
    }
    this.userSettingsDarkModeDataSource.refresh();
  }

  async enableDarkMode(): Promise<void> {
    if (!await this.waitUntilAuthenticated()) {
      const settings = this.offline.get();
      settings.darkMode = true;
      this.offline.set(settings);
    } else {
      await this.enableUserSettingsDarkModeMethod.call();
    }
    this.userSettingsDarkModeDataSource.refresh();
  }

}
