import {
  inject,
  Injectable,
} from '@angular/core';
import { BaseUserSettingsService } from './base-user-settings.service';
import { SettingsControllerGetRemoteMethod } from './openapi/remote-methods/settings-controller-get.remote-method';
import { SettingsControllerSetRemoteMethod } from './openapi/remote-methods/settings-controller-set.remote-method';
import { UserSettings } from './user-settings';
import { UserSettingsOfflineService } from './user-settings-offline.service';
import { UserSettingsDataSource } from './user-settings.data-source';

@Injectable({ providedIn: 'root' })
export class UserSettingsService<US = unknown> extends BaseUserSettingsService {

  protected readonly userSettingsDataSource = inject(UserSettingsDataSource);
  protected readonly setUserSettingsMethod = inject(SettingsControllerSetRemoteMethod);
  protected readonly getUserSettingsMethod = inject(SettingsControllerGetRemoteMethod);

  protected readonly offline = inject(UserSettingsOfflineService);

  async set(settings: UserSettings<US>): Promise<void> {
    if (!await this.waitUntilAuthenticated()) {
      this.offline.set(settings);
    } else {
      await this.setUserSettingsMethod.call({ requestBody: settings });
    }
    this.userSettingsDataSource.refresh();
  }

  async get(): Promise<UserSettings<US>> {
    if (!await this.waitUntilAuthenticated()) {
      return this.offline.get();
    }
    return this.getUserSettingsMethod.call();
  }

}
