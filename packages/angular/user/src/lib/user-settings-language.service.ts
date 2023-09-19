import {
  inject,
  Injectable,
} from '@angular/core';
import { LanguageControllerGetRemoteMethod } from './remote-methods/language-controller-get.remote-method';
import { LanguageControllerSetRemoteMethod } from './remote-methods/language-controller-set.remote-method';
import { UserSettingsLanguageDataSource } from './user-settings-language.data-source';

@Injectable({ providedIn: 'root' })
export class UserSettingsLanguageService {

  protected readonly userSettingsLanguageDataSource = inject(UserSettingsLanguageDataSource);
  protected readonly getUserSettingsLanguageMethod = inject(LanguageControllerGetRemoteMethod);
  protected readonly setUserSettingsLanguageMethod = inject(LanguageControllerSetRemoteMethod);

  async getLanguage(): Promise<string> {
    return this.getUserSettingsLanguageMethod.call();
  }

  async setLanguage(language: string): Promise<void> {
    await this.setUserSettingsLanguageMethod.call({ parameters: { language } });
    this.userSettingsLanguageDataSource.refresh();
  }

}
