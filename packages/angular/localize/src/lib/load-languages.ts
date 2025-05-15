import { registerLocaleData } from '@angular/common';
import { loadTranslations } from '@angular/localize';
import { xliffToJson } from './xliff-to-json';

function isTranslationXml(xml: string): boolean {
  return !!xml && typeof xml === 'string' && xml.startsWith('<?xml') && xml.includes('<xliff');
}

/**
 * Fetches the translation file for the specified locale in XLIFF format.
 *
 * @param {string} locale - The locale identifier for which the translation file should be fetched.
 * @return {Promise<string | null>} A promise that resolves to the XLIFF translation file as a string
 * if successfully fetched and valid, or null if the file is invalid or could not be fetched.
 */
async function fetchTranslation(locale: string): Promise<string | null> {

  let xml: string;
  try {
    xml = await fetch(`/i18n/${ locale }.xlf`).then((r) => r.text());
    if (!isTranslationXml(xml)) {
      console.error(`Invalid XLIFF file for locale ${ locale }`);
      return null;
    }
    return xml;
  } catch (e: any) {
    console.warn(`Could not download XLIFF file for locale ${ locale }: ${ e.message }`);
  }

  return null;

}

/**
 * Fetches translations for a specified locale, attempts to use preferred languages or a fallback if necessary.
 * The function retrieves and parses translation data from XLIFF files.
 *
 * @param {string} locale - The primary locale for which to fetch translations.
 * @param {string[]} preferredLanguages - An array of preferred fallback locales to try if the primary locale fails.
 * @param {string} fallback - The fallback locale to be used if both the primary and preferred locales fail.
 * @return {Promise<{ json: any, locale: string } | null>} A promise resolving to an object containing the parsed translation data (json) and the effective locale, or null if loading fails.
 */
async function fetchTranslations(locale: string, preferredLanguages: string[], fallback: string): Promise<{ json: any, locale: string } | null> {
  let xml: string | null = null;
  let currentLocale: string | undefined = locale;
  do {
    xml = await fetchTranslation(currentLocale);
    if (!xml) {
      currentLocale = preferredLanguages.shift();
    }
  } while (!xml && currentLocale);

  if (!xml) {
    console.error(`Could not download XLIFF file for locale ${ locale } load fallback`);
    try {
      xml = await fetch(`/i18n/${ fallback }.xlf`).then((r) => r.text());
      currentLocale = locale;
      if (xml && !isTranslationXml(xml)) {
        console.error(`Invalid XLIFF file for fallback locale ${ fallback }`);
      }
    } catch (e: any) {
      console.warn(`Could not download XLIFF file for fallback locale ${ fallback }: ${ e.message }`);
    }
  }

  if (!xml) {
    console.error(`Could not download XLIFF file for locale ${ locale } or preferred ${preferredLanguages.join(', ')} or fallback ${ fallback }`);
    return null;
  }

  if (!isTranslationXml(xml)) {
    console.error(`Invalid XLIFF file for fallback locale ${ currentLocale }`);
  }

  let json: any;
  try {
    json = await xliffToJson(xml);
  } catch (e: any) {
    console.error(`Could not parse XLIFF file for locale ${ locale }: ${ e.message }`);
    return null;
  }

  return { json, locale: currentLocale ?? locale };

}

/**
 * Loads the locale data module for the specified locale and registers it.
 *
 * @param {string} locale - The locale identifier for which the module needs to be loaded.
 * @return {Promise<void>} A promise that resolves when the module is successfully loaded and registered, or logs an error if loading fails.
 */
async function defaultLoadModule(locale: string) {

  try {
    // Load required locale module (needs to be adjusted for different locales)
    let module: { default: any } | null = null;
    switch (locale) {

      case 'en':
        module = await import('@angular/common/locales/en');
        break;

      case 'de':
        module = await import('@angular/common/locales/de');
        break;

    }
    if (module) {
      registerLocaleData(module.default);
    }
  } catch (e: any) {
    console.error(`Could not load locale module for locale ${ locale }: ${ e.message }`);
  }

}

/**
 * Loads language translations and sets the locale for the application.
 * This function fetches the translations based on the specified locale, preferred languages,
 * and a fallback, then initializes the translations and optionally loads additional modules.
 *
 * @param {function} loadModule - A function to load additional modules for the specified locale. Defaults to `defaultLoadModule`.
 * @param {string} [locale] - The primary locale to be used. Defaults to the stored locale, browser language, or 'en'.
 * @param {string[]} [preferredLanguages] - A list of preferred languages to use, derived from the browser or input. Defaults to the browser's preferred languages.
 * @param {string} [fallback] - The fallback key for translation files. Defaults to 'messages'.
 * @return {Promise<string>} The resolved locale, as a string.
 */
export async function loadLanguages(
  loadModule: (locale: string) => Promise<void> = defaultLoadModule,
  locale: string = localStorage.getItem("locale") || navigator.language.split('-')[0] || 'en',
  preferredLanguages = navigator.languages?.map((l) => l.split('-')[0]) ?? [],
  fallback = 'messages'
) {
  // Fetch XLIFF translation file and transform to JSON format (JSON translations can be used directly)
  const response = await fetchTranslations(locale, preferredLanguages, fallback);

  if (response) {
    console.log('json', response.json);
    // Initialize translation
    loadTranslations(response.json);
    locale = response.locale;
    $localize.locale = locale;
    localStorage.setItem("locale", locale);
    await loadModule(locale);
  }

  return locale;
}
