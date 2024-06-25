import {
  inject,
  Injectable,
} from '@angular/core';
import { DarkModeControllerDisableRemoteMethod } from './openapi/remote-methods/dark-mode-controller-disable.remote-method';
import { DarkModeControllerEnableRemoteMethod } from './openapi/remote-methods/dark-mode-controller-enable.remote-method';
import { DarkModeControllerGetRemoteMethod } from './openapi/remote-methods/dark-mode-controller-get.remote-method';
import { DarkModeControllerToggleRemoteMethod } from './openapi/remote-methods/dark-mode-controller-toggle.remote-method';
import { UserSettingsDarkModeDataSource } from './user-settings-dark-mode.data-source';

@Injectable({ providedIn: 'root' })
export class UserSettingsDarkModeService {

  protected readonly getUserSettingsDarkModeMethod = inject(DarkModeControllerGetRemoteMethod);
  protected readonly toggleUserSettingsDarkModeMethod = inject(DarkModeControllerToggleRemoteMethod);
  protected readonly disableUserSettingsDarkModeMethod = inject(DarkModeControllerDisableRemoteMethod);
  protected readonly enableUserSettingsDarkModeMethod = inject(DarkModeControllerEnableRemoteMethod);
  protected readonly userSettingsDarkModeDataSource = inject(UserSettingsDarkModeDataSource);

  async getDarkMode(): Promise<boolean> {
    return this.getUserSettingsDarkModeMethod.call();
  }

  async toggleDarkMode(): Promise<void> {
    await this.toggleUserSettingsDarkModeMethod.call();
    this.userSettingsDarkModeDataSource.refresh();
  }

  async disableDarkMode(): Promise<void> {
    await this.disableUserSettingsDarkModeMethod.call();
    this.userSettingsDarkModeDataSource.refresh();
  }

  async enableDarkMode(): Promise<void> {
    await this.enableUserSettingsDarkModeMethod.call();
    this.userSettingsDarkModeDataSource.refresh();
  }

}
