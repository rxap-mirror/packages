import {
  Inject,
  Injectable,
  LOCALE_ID,
} from '@angular/core';
import { UserSettingsLanguageService } from '@rxap/ngx-user';

@Injectable({ providedIn: 'root' })
export class I18nService {

  public readonly currentLanguage: string;

  constructor(
    @Inject(LOCALE_ID)
    private readonly localId: string,
    private readonly userSettingsLanguageService: UserSettingsLanguageService,
  ) {
    this.currentLanguage = this.localId.replace(/-[A-Z]+$/, '');
  }

  public async setLanguage(language: string) {
    await this.userSettingsLanguageService.setLanguage(language);
    this.redirect(language);
  }

  public redirect(next: string, current: string = this.currentLanguage) {
    if (current === next) {
      console.warn('[I18nService] redirect not required - language unchanged');
      return;
    }
    const redirectUrl =
      location.origin +
      location.pathname.replace(new RegExp(`^/${ current }`), `/${ next }`) +
      location.search;
    console.log('[I18nService] redirect to: ' + redirectUrl);
    location.replace(redirectUrl);
  }

}
