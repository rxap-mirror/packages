import { JsonObject } from '@angular-devkit/core';

export interface BuildBuilderSchema extends JsonObject {
  defaultLanguage?: string;
  availableLanguages?: string[];
  indexHtmlTemplate: string;
}
