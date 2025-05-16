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
export async function fetchTranslations(locale: string, preferredLanguages: string[], fallback: string): Promise<{ json: any, locale: string } | null> {
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
