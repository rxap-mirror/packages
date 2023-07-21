import {
  Inject,
  Injectable,
  LOCALE_ID,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class LanguageSelectorService {
  public readonly languages: any;
  public readonly defaultLanguage: string;
  public selectedLanguage: string;

  constructor(
    private readonly config: ConfigService,
    @Inject(LOCALE_ID)
    private readonly localId: string,
    private readonly i18nService: I18nService,
  ) {
    this.languages = this.config.get<any>('i18n.languages') ?? {};
    this.defaultLanguage =
      this.config.get('i18n.defaultLanguage') ??
      Object.keys(this.languages)[0] ??
      'en';
    this.selectedLanguage = this.i18nService.currentLanguage;
  }

  public async setLanguage(language: string) {
    if (language !== this.i18nService.currentLanguage) {
      await this.i18nService.setLanguage(language);
    }
  }

}
