import { registerLocaleData } from '@angular/common';
import { loadTranslations } from '@angular/localize';
import { xliffToJson } from './xliff-to-json';

async function fetchTranslations(locale: string, fallback: string) {

  let xml: string;
  try {
    xml = await fetch(`/i18n/${ locale }.xlf`).then((r) => r.text());
  } catch (e: any) {
    console.error(`Could not download XLIFF file for locale ${ locale }: ${ e.message }`);
    try {
      xml = await fetch(`/i18n/${ fallback }.xlf`).then((r) => r.text());
    } catch (e: any) {
      console.error(`Could not download XLIFF file for fallback locale ${ fallback }: ${ e.message }`);
      throw new Error(`Could not download XLIFF file for locale ${ locale } or fallback ${ fallback }: ${ e.message }`);
    }
  }

  let json: any;
  try {
    json = xliffToJson(xml);
  } catch (e: any) {
    console.error(`Could not parse XLIFF file for locale ${ locale }: ${ e.message }`);
    throw new Error(`Could not parse XLIFF file for locale ${ locale }: ${ e.message }`);
  }

  return json;

}

async function defaultLoadModule(locale: string) {

  // Load required locale module (needs to be adjusted for different locales)
  let module: { default: any } | null = null;
  switch (locale) {

    case 'en':
      module = await import('@angular/common/locales/en');
      break;

    case 'de':
      module = await import('@angular/common/locales/de');
      break;

    case 'fr':
      module = await import('@angular/common/locales/fr');
      break;

  }
  if (module) {
    registerLocaleData(module.default);
  }

}

export async function loadLanguages(
  loadModule: (locale: string) => Promise<void> = defaultLoadModule,
  locale: string = localStorage.getItem("locale") || "en",
  fallback = 'messages'
) {
  // Fetch XLIFF translation file and transform to JSON format (JSON translations can be used directly)
  const json = await fetchTranslations(locale, fallback);

  // Initialize translation
  loadTranslations(json);
  $localize.locale = locale;

  await loadModule(locale);

  return locale;
}
