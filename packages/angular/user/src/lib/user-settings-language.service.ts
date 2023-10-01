import {
  inject,
  Injectable,
} from '@angular/core';
import { BaseUserSettingsService } from './base-user-settings.service';
import { LanguageControllerGetRemoteMethod } from './openapi/remote-methods/language-controller-get.remote-method';
import { LanguageControllerSetRemoteMethod } from './openapi/remote-methods/language-controller-set.remote-method';
import { UserSettingsLanguageDataSource } from './user-settings-language.data-source';
import { UserSettingsOfflineService } from './user-settings-offline.service';

@Injectable({ providedIn: 'root' })
export class UserSettingsLanguageService extends BaseUserSettingsService {

  protected readonly userSettingsLanguageDataSource = inject(UserSettingsLanguageDataSource);
  protected readonly getUserSettingsLanguageMethod = inject(LanguageControllerGetRemoteMethod);
  protected readonly setUserSettingsLanguageMethod = inject(LanguageControllerSetRemoteMethod);

  protected readonly offline = inject(UserSettingsOfflineService);

  async getLanguage(): Promise<string> {
    if (!await this.waitUntilAuthenticated()) {
      return this.offline.get().language;
    }
    return this.getUserSettingsLanguageMethod.call();
  }

  async setLanguage(language: string): Promise<void> {
    if (!await this.waitUntilAuthenticated()) {
      const settings = this.offline.get();
      settings.language = language;
      this.offline.set(settings);
    } else {
      await this.setUserSettingsLanguageMethod.call({ parameters: { language } });
    }
    this.userSettingsLanguageDataSource.refresh();
  }

}
