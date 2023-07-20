export interface I18nExecutorSchema {
  defaultLanguage?: string;
  availableLanguages?: string[];
  indexHtmlTemplate: string;
  assets?: Array<string | { glob: string, input: string, output: string }> | boolean;
  outputPath?: string;
}
