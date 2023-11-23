import {
  inject,
  Injectable,
} from '@angular/core';
import { BaseUserSettingsService } from './base-user-settings.service';
import { LanguageControllerGetRemoteMethod } from './openapi/remote-methods/language-controller-get.remote-method';
import { LanguageControllerSetRemoteMethod } from './openapi/remote-methods/language-controller-set.remote-method';
import { UserSettingsLanguageDataSource } from './user-settings-language.data-source';
import { UserSettingsOfflineService } from './user-settings-offline.service';

export type SetLanguageHook = (language: string, unauthenticated: boolean) => void;

@Injectable({ providedIn: 'root' })
export class UserSettingsLanguageService extends BaseUserSettingsService {

  protected readonly userSettingsLanguageDataSource = inject(UserSettingsLanguageDataSource);
  protected readonly getUserSettingsLanguageMethod = inject(LanguageControllerGetRemoteMethod);
  protected readonly setUserSettingsLanguageMethod = inject(LanguageControllerSetRemoteMethod);

  protected readonly offline = inject(UserSettingsOfflineService);

  protected readonly setLanguageHook = new Set<SetLanguageHook>();

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
      this.setLanguageHook.forEach((hook) => hook(language, true));
      this.offline.set(settings);
    } else {
      this.setLanguageHook.forEach((hook) => hook(language, false));
      await this.setUserSettingsLanguageMethod.call({ parameters: { language } });
    }
    this.userSettingsLanguageDataSource.refresh();
  }

  registerSetLanguageHook(hook: SetLanguageHook): void {
    this.setLanguageHook.add(hook);
  }

  unregisterSetLanguageHook(hook: SetLanguageHook): void {
    this.setLanguageHook.delete(hook);
  }

  clearSetLanguageHook(): void {
    this.setLanguageHook.clear();
  }

}
