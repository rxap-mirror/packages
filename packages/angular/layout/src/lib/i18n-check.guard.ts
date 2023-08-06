import {
  Injectable,
  isDevMode,
} from '@angular/core';
import { RxapUserProfileService } from '@rxap/authentication';
import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class I18nCheckGuard {

  constructor(
    private readonly i18nService: I18nService,
    private readonly userProfileService: RxapUserProfileService,
  ) {
  }

  async canActivate(): Promise<boolean> {
    if (isDevMode()) {
      return true;
    }
    const selectedLanguage = (await this.userProfileService.getLanguage()) ?? 'en';
    if (this.i18nService.currentLanguage !== selectedLanguage) {
      this.i18nService.redirect(selectedLanguage);
      return false;
    }
    return true;
  }

}
