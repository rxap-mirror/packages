import { JsonObject } from '@angular-devkit/core';

export interface BuildBuilderSchema extends JsonObject {
  context?: string;
  dockerfile: string;
  destination: string[];
  buildTarget: string;
  command: string;
  preTarget: string;
}
