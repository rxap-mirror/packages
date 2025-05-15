import {
  ApplicationConfig,
  LOCALE_ID,
} from '@angular/core';
import { loadLanguages } from './load-languages';

/**
 * Loads internationalization (i18n) bootstrap settings for the application.
 *
 * @param {Partial<ApplicationConfig>} options - The application configuration options.
 * @return {Promise<void>} A promise that resolves when the i18n bootstrap process completes.
 */
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
