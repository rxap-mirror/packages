import { JsonObject } from '@angular-devkit/core';

export interface BuildBuilderSchema extends JsonObject {
  outFile?: string;
  ignoreImports?: string[];
  buildTarget: string;
  dedupeGlobs?: string[];
  includePaths?: string[];
}
