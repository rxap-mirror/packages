import {
  Provider,
  signal,
} from '@angular/core';
import { LanguageSelectorService } from '@rxap/ngx-localize';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * The styleguide has no config.json with `i18n.languages`, therefore the language selector service is
 * replaced with a static one that offers two languages and never reloads the page.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: LanguageSelectorService,
    useValue: {
      languages: signal({ en: 'English', de: 'Deutsch' }),
      defaultLanguage: signal('en'),
      selectedLanguage: signal('en'),
      hasLanguages: signal(true),
      setLanguage: () => Promise.resolve(),
    },
  },
];
