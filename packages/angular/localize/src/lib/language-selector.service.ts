import {
  computed,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import {
  ConfigService,
  LanguagesConfig,
} from '@rxap/config';

/**
 * A service that manages language selection and configuration for the application.
 * Provides functionality to retrieve available languages, default language,
 * selected language, and dynamically change the application's language settings.
 */
@Injectable({ providedIn: 'root' })
export class LanguageSelectorService {
  private readonly config = inject(ConfigService);

  public readonly languages: Signal<LanguagesConfig> = signal(this.config.get<LanguagesConfig>('i18n.languages', {}));
  public readonly defaultLanguage: Signal<string> = signal(this.config.get('i18n.defaultLanguage', Object.keys(this.languages())[0] ?? 'en'));
  public readonly selectedLanguage = signal(localStorage.getItem("locale") ?? this.defaultLanguage());

  public readonly hasLanguages = computed(() => Object.keys(this.languages()).length > 1);

  /**
   * Sets the application language to the specified value if it exists in the list of supported languages.
   * Optionally reloads the page if the `reload` parameter is set to `true`.
   *
   * @param {string} language - The language code to set as the active language.
   * @param {boolean} [reload=false] - A flag indicating whether to reload the page after updating the language.
   * @return {Promise<void>} A promise that resolves once the language has been set and optional reload is completed.
   */
  public async setLanguage(language: string, reload = false) {
    if (language !== this.selectedLanguage()) {
      if (Object.keys(this.languages()).includes(language)) {
        localStorage.setItem("locale", language);
      } else if (this.defaultLanguage()) {
        localStorage.setItem("locale", this.defaultLanguage());
      } else {
        localStorage.removeItem("locale");
      }
      if (reload) {
        location.reload();
      }
    }
  }

}
