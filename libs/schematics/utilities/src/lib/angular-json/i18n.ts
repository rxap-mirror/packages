export interface I18n {
  sourceLocale?: string | {
      /** Specifies the locale code of the source locale */
      code?: string;
      /** HTML base HREF to use for the locale (defaults to the locale code) */
      baseHref?: string;
    } | string | {
      /** Specifies the locale code of the source locale */
      code?: string;
      /** HTML base HREF to use for the locale (defaults to the locale code) */
      baseHref?: string;
    };
  locales?: {
      '[key: string]': string | Array<string> | string | Array<string> | {
          translation?: string | Array<string> | string | Array<string>;
          /** HTML base HREF to use for the locale (defaults to the locale code) */
          baseHref?: string;
        };
    };
}
