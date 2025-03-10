import {
  ApplicationConfig,
  LOCALE_ID,
} from '@angular/core';
import { loadLanguages } from './load-languages';

export async function loadI18nBootstrapHook(options: Partial<ApplicationConfig>): Promise<void> {

  try {
    const locale = await loadLanguages();
    console.debug('locale', locale);
    options.providers ??= [];
    options.providers.push({
      provide: LOCALE_ID,
      useValue: locale
    });
  } catch (e: any) {
    console.error(`Failed to load language translations: ${e.message}`);
  }

}
