import {
  inject,
  Injectable,
} from '@angular/core';
import { SettingsControllerGetRemoteMethod } from './openapi/remote-methods/settings-controller-get.remote-method';
import { SettingsControllerSetRemoteMethod } from './openapi/remote-methods/settings-controller-set.remote-method';
import { UserSettings } from './user-settings';
import { UserSettingsDataSource } from './user-settings.data-source';

@Injectable({ providedIn: 'root' })
export class UserSettingsService<US = unknown> {

  protected readonly userSettingsDataSource = inject(UserSettingsDataSource);
  protected readonly setUserSettingsMethod = inject(SettingsControllerSetRemoteMethod);
  protected readonly getUserSettingsMethod = inject(SettingsControllerGetRemoteMethod);

  async set(settings: UserSettings<US>): Promise<void> {
    await this.setUserSettingsMethod.call({ requestBody: settings });
    this.userSettingsDataSource.refresh();
  }

  async get(): Promise<UserSettings<US>> {
    return this.getUserSettingsMethod.call();
  }

}
