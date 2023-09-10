import {
  inject,
  Injectable,
} from '@angular/core';
import { Method } from '@rxap/pattern';
import {
  RXAP_DISABLE_USER_SETTINGS_DARK_MODE_METHOD,
  RXAP_ENABLE_USER_SETTINGS_DARK_MODE_METHOD,
  RXAP_GET_USER_SETTINGS_DARK_MODE_METHOD,
  RXAP_GET_USER_SETTINGS_LANGUAGE_METHOD,
  RXAP_SET_USER_SETTINGS_LANGUAGE_METHOD,
  RXAP_SET_USER_SETTINGS_METHOD,
  RXAP_TOGGLE_USER_SETTINGS_DARK_MODE_METHOD,
} from './tokens';
import { UserSettings } from './user-settings';
import { UserSettingsDataSource } from './user-settings.data-source';

@Injectable({ providedIn: 'root' })
export class UserSettingsService<US extends UserSettings = UserSettings> {

  protected readonly userSettingsDataSource = inject(UserSettingsDataSource);
  protected readonly setUserSettingsMethod = inject<Method<US, { requestBody: US }>>(RXAP_SET_USER_SETTINGS_METHOD);
  protected readonly getUserSettingsMethod = inject<Method<US>>(RXAP_SET_USER_SETTINGS_METHOD);
  protected readonly getUserSettingsLanguageMethod = inject(RXAP_GET_USER_SETTINGS_LANGUAGE_METHOD);
  protected readonly setUserSettingsLanguageMethod = inject(RXAP_SET_USER_SETTINGS_LANGUAGE_METHOD);
  protected readonly getUserSettingsDarkModeMethod = inject(RXAP_GET_USER_SETTINGS_DARK_MODE_METHOD);
  protected readonly toggleUserSettingsDarkModeMethod = inject(RXAP_TOGGLE_USER_SETTINGS_DARK_MODE_METHOD);
  protected readonly disableUserSettingsDarkModeMethod = inject(RXAP_DISABLE_USER_SETTINGS_DARK_MODE_METHOD);
  protected readonly enableUserSettingsDarkModeMethod = inject(RXAP_ENABLE_USER_SETTINGS_DARK_MODE_METHOD);

  async set(settings: US): Promise<US> {
    const result = await this.setUserSettingsMethod.call({ requestBody: settings });
    this.userSettingsDataSource.refresh();
    return result;
  }

  async get(): Promise<US> {
    return this.getUserSettingsMethod.call();
  }

  async getLanguage(): Promise<string> {
    return this.getUserSettingsLanguageMethod.call();
  }

  async setLanguage(language: string): Promise<string> {
    const result = await this.setUserSettingsLanguageMethod.call({ parameters: { language } });
    this.userSettingsDataSource.refresh();
    return result;
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
