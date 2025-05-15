import { registerLocaleData } from '@angular/common';
import { loadTranslations } from '@angular/localize';
import { xliffToJson } from './xliff-to-json';

function isTranslationXml(xml: string): boolean {
  return !!xml && typeof xml === 'string' && xml.startsWith('<?xml') && xml.includes('<xliff');
}

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
