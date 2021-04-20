import { JsonObject } from '@angular-devkit/core';

export interface BuildBuilderSchema extends JsonObject {
  release?: string;
  commit?: string;
  timestamp?: string;
  branch?: string;
  tag?: string;
}
