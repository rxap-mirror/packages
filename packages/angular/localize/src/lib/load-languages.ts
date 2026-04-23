import { registerLocaleData } from '@angular/common';
import { loadTranslations } from '@angular/localize';
import { LOCALE_STORAGE_KEY } from './const';

/**
 * Loads the locale data module for the specified locale and registers it.
 *
 * @param {string} locale - The locale identifier for which the module needs to be loaded.
 * @return {Promise<void>} A promise that resolves when the module is successfully loaded and registered, or logs an error if loading fails.
 */
export async function defaultLoadModule(locale: string) {

  try {
    // Load required locale module (needs to be adjusted for different locales)
    let module: { default: any } | null = null;
    switch (locale.split('-')[0].toLowerCase()) {

      case 'en':
        module = await import('@angular/common/locales/en');
        break;

    }
    if (module) {
      registerLocaleData(module.default);
    }
  } catch (e: any) {
    console.error(`Could not load locale module for locale ${ locale }: ${ e.message }`);
  }

}

export type FetchTranslationsFunction = (locale: string, preferredLanguages: string[], fallback: string) => Promise<{ json: any, locale: string } | null>;

export type LoadModuleFunction = (locale: string) => Promise<void>;

/**
 * Loads language translations and sets the locale for the application.
 * This function fetches the translations based on the specified locale, preferred languages,
 * and a fallback, then initializes the translations and optionally loads additional modules.
 *
 * @param {function} fetchTranslations - A function to fetch the translation json map
 * @param {function} loadModule - A function to load additional modules for the specified locale. Defaults to `defaultLoadModule`.
 * @param {string} [locale] - The primary locale to be used. Defaults to the stored locale, browser language, or 'en'.
 * @param {string[]} [preferredLanguages] - A list of preferred languages to use, derived from the browser or input. Defaults to the browser's preferred languages.
 * @param {string} [fallback] - The fallback key for translation files. Defaults to 'messages'.
 * @return {Promise<string>} The resolved locale, as a string.
 */
export async function loadLanguages(
  fetchTranslations: FetchTranslationsFunction,
  loadModule: LoadModuleFunction = defaultLoadModule,
  locale: string = localStorage.getItem(LOCALE_STORAGE_KEY) || navigator.language || 'en',
  preferredLanguages = (navigator.languages ?? []).slice(),
  fallback = 'messages',
) {
  // Fetch XLIFF translation file and transform to JSON format (JSON translations can be used directly)
  const response = await fetchTranslations(locale, preferredLanguages, fallback);

  if (response) {
    // Initialize translation
    loadTranslations(response.json);
    locale = response.locale;
    $localize.locale = locale;
    await loadModule(locale);
  }
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);

  return locale;
}
