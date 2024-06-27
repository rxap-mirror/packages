import {
  inject,
  Injectable,
  isDevMode,
  LOCALE_ID,
  signal,
  Signal,
} from '@angular/core';
import { UserSettingsLanguageService } from '@rxap/ngx-user';

@Injectable({ providedIn: 'root' })
export class I18nService {

  private readonly localId: string = inject(LOCALE_ID);
  private readonly userSettingsLanguageService = inject(UserSettingsLanguageService);

  public readonly currentLanguage: Signal<string> = signal(this.localId.replace(/-[A-Z]+$/, ''));

  public async setLanguage(language: string) {
    await this.userSettingsLanguageService.setLanguage(language);
    if (!isDevMode()) {
      this.redirect(language);
    }
    if (typeof (this.currentLanguage as any)['set'] === 'function') {
      (this.currentLanguage as any).set(language);
    }
  }

  public redirect(next: string, current: string = this.currentLanguage()) {
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
