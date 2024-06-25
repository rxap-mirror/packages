import {
  inject,
  Injectable,
} from '@angular/core';
import { LanguageControllerGetRemoteMethod } from './openapi/remote-methods/language-controller-get.remote-method';
import { LanguageControllerSetRemoteMethod } from './openapi/remote-methods/language-controller-set.remote-method';
import { UserSettingsLanguageDataSource } from './user-settings-language.data-source';

export type SetLanguageHook = (language: string, unauthenticated: boolean) => void;

@Injectable({ providedIn: 'root' })
export class UserSettingsLanguageService {

  protected readonly userSettingsLanguageDataSource = inject(UserSettingsLanguageDataSource);
  protected readonly getUserSettingsLanguageMethod = inject(LanguageControllerGetRemoteMethod);
  protected readonly setUserSettingsLanguageMethod = inject(LanguageControllerSetRemoteMethod);

  protected readonly setLanguageHook = new Set<SetLanguageHook>();

  async getLanguage(): Promise<string> {
    return this.getUserSettingsLanguageMethod.call();
  }

  async setLanguage(language: string): Promise<void> {
    this.setLanguageHook.forEach((hook) => hook(language, false));
    await this.setUserSettingsLanguageMethod.call({ parameters: { language } });
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
