import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceRule,
  Rule,
} from './coerce-rule';

export type Include = LocalInclude | ComponentInclude;

export interface BaseInclude {
  rules?: Rule[];
}

export interface LocalInclude extends BaseInclude {
  local: string;
}

export function IsLocalInclude(include: Include): include is LocalInclude {
  return (include as LocalInclude).local !== undefined;
}

export interface ComponentInclude extends BaseInclude {
  component: string;
}

export function IsComponentInclude(include: Include): include is ComponentInclude {
  return (include as ComponentInclude).component !== undefined;
}

function compareInclude(a: Include, b: Include) {
  if (IsLocalInclude(a) && IsLocalInclude(b)) {
    return a.local === b.local;
  }
  if (IsComponentInclude(a) && IsComponentInclude(b)) {
    return a.component === b.component;
  }
  return false;
}

export function CoerceInclude(includeList: Include[], coerceInclude: Include) {
  CoerceArrayItems(includeList, [coerceInclude], compareInclude);
  const include = includeList.find((include: Include) => compareInclude(include, coerceInclude));
  if (coerceInclude.rules?.length) {
    include.rules ??= [];
    coerceInclude.rules.forEach(rule => CoerceRule(include.rules, rule));
  }
}
