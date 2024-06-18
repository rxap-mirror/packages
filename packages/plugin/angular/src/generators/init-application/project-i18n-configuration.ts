export interface ProjectI18nConfiguration {
  sourceLocale?: string;
  locales?: Record<string, { translation: string, baseHref: string }>;
}
