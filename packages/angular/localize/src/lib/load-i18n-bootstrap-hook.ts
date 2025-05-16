import {
  ApplicationConfig,
  LOCALE_ID,
} from '@angular/core';
import {
  defaultLoadModule,
  FetchTranslationsFunction,
  loadLanguages,
  LoadModuleFunction,
} from './load-languages';

export async function loadI18nBootstrapHook(
  fetchTranslations: FetchTranslationsFunction,
  loadModule: LoadModuleFunction = defaultLoadModule,
  locale?: string,
  preferredLanguages?: string[],
  fallback?: string,
) {
  return async (options: Partial<ApplicationConfig>) => {
    try {
      const currentLocale = await loadLanguages(
        fetchTranslations,
        loadModule,
        locale,
        preferredLanguages,
        fallback
      );
      console.debug('locale', currentLocale);
      options.providers ??= [];
      options.providers.push({
        provide: LOCALE_ID,
        useValue: currentLocale
      });
    } catch (e: any) {
      console.error(`Failed to load language translations: ${ e.message }`);
    }
  };
}
