import { deepMerge } from '@rxap/utilities';

export type IncludeComponentInput = Record<string, unknown>;

export function CoerceInputs(current: IncludeComponentInput, addition: IncludeComponentInput) {
  deepMerge(current, addition);
}
