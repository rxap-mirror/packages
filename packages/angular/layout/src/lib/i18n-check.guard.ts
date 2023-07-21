import {
  Inject,
  Injectable,
  LOCALE_ID,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import { I18nService } from './i18n.service';
import { RxapUserProfileService } from '@rxap/authentication';

@Injectable({ providedIn: 'root' })
export class I18nCheckGuard {

  constructor(
    private readonly config: ConfigService,
    @Inject(LOCALE_ID)
    private readonly localId: string,
    private readonly i18nService: I18nService,
    private readonly userProfileService: RxapUserProfileService,
  ) {
  }

  async canActivate(): Promise<boolean> {
    const selectedLanguage = (await this.userProfileService.getLanguage()) ?? 'en';
    if (this.i18nService.currentLanguage !== selectedLanguage) {
      await this.i18nService.redirect(selectedLanguage);
      return false;
    }
    return true;
  }

}
