import {
  inject,
  Injectable,
} from '@angular/core';
import { DarkModeControllerDisableRemoteMethod } from './remote-methods/dark-mode-controller-disable.remote-method';
import { DarkModeControllerEnableRemoteMethod } from './remote-methods/dark-mode-controller-enable.remote-method';
import { DarkModeControllerGetRemoteMethod } from './remote-methods/dark-mode-controller-get.remote-method';
import { DarkModeControllerToggleRemoteMethod } from './remote-methods/dark-mode-controller-toggle.remote-method';
import { LanguageControllerGetRemoteMethod } from './remote-methods/language-controller-get.remote-method';
import { LanguageControllerSetRemoteMethod } from './remote-methods/language-controller-set.remote-method';
import { SettingsControllerGetRemoteMethod } from './remote-methods/settings-controller-get.remote-method';
import { SettingsControllerSetRemoteMethod } from './remote-methods/settings-controller-set.remote-method';
import { SettingsControllerSetRequestBody } from './request-bodies/settings-controller-set.request-body';
import { SettingsControllerGetResponse } from './responses/settings-controller-get.response';
import { UserSettingsDataSource } from './user-settings.data-source';

@Injectable({ providedIn: 'root' })
export class UserSettingsService<US> {

  protected readonly userSettingsDataSource = inject(UserSettingsDataSource);
  protected readonly setUserSettingsMethod = inject(SettingsControllerSetRemoteMethod);
  protected readonly getUserSettingsMethod = inject(SettingsControllerGetRemoteMethod);
  protected readonly getUserSettingsLanguageMethod = inject(LanguageControllerGetRemoteMethod);
  protected readonly setUserSettingsLanguageMethod = inject(LanguageControllerSetRemoteMethod);
  protected readonly getUserSettingsDarkModeMethod = inject(DarkModeControllerGetRemoteMethod);
  protected readonly toggleUserSettingsDarkModeMethod = inject(DarkModeControllerToggleRemoteMethod);
  protected readonly disableUserSettingsDarkModeMethod = inject(DarkModeControllerDisableRemoteMethod);
  protected readonly enableUserSettingsDarkModeMethod = inject(DarkModeControllerEnableRemoteMethod);

  async set(settings: SettingsControllerSetRequestBody<US>): Promise<void> {
    await this.setUserSettingsMethod.call({ requestBody: settings });
    this.userSettingsDataSource.refresh();
  }

  async get(): Promise<SettingsControllerGetResponse<US>> {
    return this.getUserSettingsMethod.call();
  }

  async getLanguage(): Promise<string> {
    return this.getUserSettingsLanguageMethod.call();
  }

  async setLanguage(language: string): Promise<void> {
    await this.setUserSettingsLanguageMethod.call({ parameters: { language } });
    this.userSettingsDataSource.refresh();
  }

  async getDarkMode(): Promise<boolean> {
    return this.getUserSettingsDarkModeMethod.call();
  }

  async toggleDarkMode(): Promise<boolean> {
    const result = await this.toggleUserSettingsDarkModeMethod.call();
    this.userSettingsDataSource.refresh();
    return result;
  }

  async disableDarkMode(): Promise<boolean> {
    const result = await this.disableUserSettingsDarkModeMethod.call();
    this.userSettingsDataSource.refresh();
    return result;
  }

  async enableDarkMode(): Promise<boolean> {
    const result = await this.enableUserSettingsDarkModeMethod.call();
    this.userSettingsDataSource.refresh();
    return result;
  }

}
