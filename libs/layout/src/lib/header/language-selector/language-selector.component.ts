import {
  Component,
  ChangeDetectionStrategy,
  Injectable,
  Inject,
} from '@angular/core';
import { ConfigService } from '@rxap/config';

export const RXAP_SELECTED_LANGUAGE_LOCAL_STORAGE_KEY =
  'rxap__selected_language';
export const RXAP_SELECTED_LANGUAGE_CHANGE_LOCAL_STORAGE_KEY =
  'rxap__selected_language_last_change';

@Injectable({ providedIn: 'root' })
export class LanguageSelectorService {
  public readonly languages: any;
  public readonly defaultLanguage: string;
  public selectedLanguage: string;

  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService
  ) {
    this.languages = this.config.get<any>('i18n.languages') ?? {};
    this.defaultLanguage =
      this.config.get('i18n.defaultLanguage') ??
      Object.keys(this.languages)[0] ??
      'en';
    this.selectedLanguage =
      localStorage.getItem(RXAP_SELECTED_LANGUAGE_LOCAL_STORAGE_KEY) ??
      this.defaultLanguage;
  }

  public setLanguage(language: string) {
    if (language !== this.selectedLanguage) {
      this.redirect(language);
    }
  }

  public autoRedirect() {
    if (localStorage.getItem(RXAP_SELECTED_LANGUAGE_LOCAL_STORAGE_KEY)) {
      this.redirect(
        localStorage.getItem(RXAP_SELECTED_LANGUAGE_LOCAL_STORAGE_KEY)!
      );
    }
  }

  private redirect(language: string) {
    const currentUrl = location.origin + location.pathname + location.search;
    const redirectUrl =
      location.origin +
      `/${language}` +
      location.pathname.replace(new RegExp(`^\/${this.selectedLanguage}`), '') +
      location.search;
    this.selectedLanguage = language;
    localStorage.setItem(RXAP_SELECTED_LANGUAGE_LOCAL_STORAGE_KEY, language);
    if (currentUrl !== redirectUrl) {
      if (this.checkLastChange()) {
        location.replace(redirectUrl);
      }
    } else {
      console.log('Redirect not required');
    }
  }

  private checkLastChange(): boolean {
    const lastChangeString = localStorage.getItem(
      RXAP_SELECTED_LANGUAGE_CHANGE_LOCAL_STORAGE_KEY
    );
    if (lastChangeString) {
      if (Date.now() - parseInt(lastChangeString, 10) < 1000) {
        return false;
      }
    }
    localStorage.setItem(
      RXAP_SELECTED_LANGUAGE_CHANGE_LOCAL_STORAGE_KEY,
      Date.now().toFixed(0)
    );
    return true;
  }
}

@Component({
  selector: 'rxap-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rxap-language-selector' },
})
export class LanguageSelectorComponent {
  constructor(public readonly language: LanguageSelectorService) {}
}
