import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import {
  ConfigService,
  LanguagesConfig,
} from '@rxap/config';
import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class LanguageSelectorService {
  private readonly config = inject(ConfigService);
  private readonly i18nService = inject(I18nService);

  public readonly languages: Signal<LanguagesConfig> = signal(this.config.get<LanguagesConfig>('i18n.languages', {}));
  public readonly defaultLanguage: Signal<string> = signal(this.config.get('i18n.defaultLanguage', Object.keys(this.languages())[0] ?? 'en'));
  public readonly selectedLanguage = signal(this.i18nService.currentLanguage());

  public readonly hasLanguages = computed(() => Object.keys(this.languages()).length > 1);

  constructor() {
    effect(() => {
      const currentLanguage = this.i18nService.currentLanguage();
      this.selectedLanguage.set(currentLanguage);
    }, { allowSignalWrites: true });
  }

  public async setLanguage(language: string) {
    if (language !== this.i18nService.currentLanguage()) {
      await this.i18nService.setLanguage(language);
    }
  }

}
