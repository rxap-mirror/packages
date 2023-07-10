import { assertString } from './util/assertString';
import { decimal } from './alpha';

export interface IsFloatOptions {
  locale?: number;
  min?: number;
  max?: number;
  lt?: number;
  gt?: number;
}

export function isFloat(str: unknown, options: IsFloatOptions = {}) {
  assertString(str);
  const float = new RegExp(`^(?:[-+])?(?:[0-9]+)?(?:\\${options.locale ? decimal[options.locale] : '.'}[0-9]*)?(?:[eE][\\+\\-]?(?:[0-9]+))?$`);
  if (str === '' || str === '.' || str === '-' || str === '+') {
    return false;
  }
  const value = parseFloat(str.replace(',', '.'));
  return float.test(str) &&
    (!options.min || value >= options.min) &&
    (!options.max || value <= options.max) &&
    (!options.lt || value < options.lt) &&
    (!options.gt || value > options.gt);
}

export const isFloatLocales = Object.keys(decimal);
