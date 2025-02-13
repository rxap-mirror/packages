export interface I18nExecutorSchema {
  availableLanguages?: Array<string>;
  defaultLanguage?: string;
  indexHtmlTemplate?: string;
  buildTarget?: string;
  assets?: Array<string> | boolean;
}
