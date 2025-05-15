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

@Injectable({ providedIn: 'root' })
export class LanguageSelectorService {
  private readonly config = inject(ConfigService);

  public readonly languages: Signal<LanguagesConfig> = signal(this.config.get<LanguagesConfig>('i18n.languages', {}));
  public readonly defaultLanguage: Signal<string> = signal(this.config.get('i18n.defaultLanguage', Object.keys(this.languages())[0] ?? 'en'));
  public readonly selectedLanguage = signal(localStorage.getItem("locale") ?? this.defaultLanguage());

  public readonly hasLanguages = computed(() => Object.keys(this.languages()).length > 1);

  public async setLanguage(language: string, reload = false) {
    if (language !== this.selectedLanguage()) {
      if (Object.keys(this.languages()).includes(language)) {
        localStorage.setItem("locale", language);
        if (reload) {
          location.reload();
        }
      }
    }
  }

}
