import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceRule,
  Rule,
} from './coerce-rule';

export interface Include {
  local: string;
  rules?: Rule[];
}

export function CoerceInclude(includeList: Include[], local: string, rules?: Rule[]) {
  CoerceArrayItems(includeList, [
    { local: local }
  ], (a, b) => a.local === b.local);
  const include = includeList.find((include: Include) => include.local === local);
  if (rules?.length) {
    include.rules ??= [];
    rules.forEach(rule => CoerceRule(include.rules, rule));
  }
}
