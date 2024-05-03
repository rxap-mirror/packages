import {
  CoerceArrayItems,
  CoerceArrayItemsOptions,
} from '@rxap/utilities';

export interface Rule {
  if?: string;
  when?: string;
}

export interface Include {
  local: string;
  rules?: Rule[];
}

export function CoerceRule(ruleList: Rule[], rule: Rule) {
  if (!rule.when && !rule.if) {
    throw new Error('Rule must have either a when or if property');
  }
  CoerceArrayItems(ruleList, [rule], {
    compareTo: (a: Rule, b: Rule) => a.if === b.if && a.when === b.when,
    compareFn: (a: Rule, b: Rule) => {
      const order = {
        never: 0,
        manuel: 1,
        on_success: 2,
        always: 3
      };

      // Retrieve the order values of the 'when' property for both objects
      const orderA = order[a.when];
      const orderB = order[b.when];

      // Compare these order values
      if (orderA < orderB) {
        return -1;
      }
      if (orderA > orderB) {
        return 1;
      }
      return 0;
    }
  } as CoerceArrayItemsOptions);
}

export function CoerceRules(ruleList: Rule[], rules: Rule[]) {
  rules.forEach(rule => CoerceRule(ruleList, rule));
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
