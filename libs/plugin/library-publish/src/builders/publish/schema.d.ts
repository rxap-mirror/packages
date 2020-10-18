import { JsonObject } from '@angular-devkit/core';

export interface BuildBuilderSchema extends JsonObject {
  buildTarget: string;
  preTarget: string;
  registry?: string;
}
