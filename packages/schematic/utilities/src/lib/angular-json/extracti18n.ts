export interface Extracti18n {
  /** A browser builder target to extract i18n messages in the format of `project:target[:configuration]`. You can also pass in more than one configuration name as a comma-separated list. Example: `project:target:production,staging`. */
  browserTarget?: string;
  /** Output format for the generated file. */
  format?: 'xmb' | 'xlf' | 'xlif' | 'xliff' | 'xlf2' | 'xliff2' | 'json' | 'arb';
  /** Output format for the generated file. */
  i18nFormat?: 'xmb' | 'xlf' | 'xlif' | 'xliff' | 'xlf2' | 'xliff2' | 'json' | 'arb';
  /** Specifies the source language of the application. */
  i18nLocale?: string;
  /** Use Ivy compiler to extract translations. */
  ivy?: boolean;
  /** Log progress to the console. */
  progress?: boolean;
  /** Path where output will be placed. */
  outputPath?: string;
  /** Name of the file to output. */
  outFile?: string;
}
