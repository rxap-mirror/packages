import { assertString } from './util/assertString';

const int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
const intLeadingZeroes = /^[-+]?[0-9]+$/;

export interface IsIntOptions {
  allow_leading_zeroes?: boolean;
  min?: number;
  max?: number;
  lt?: number;
  gt?: number;
}

export function isInt(str: unknown, options?: IsIntOptions) {
  assertString(str);
  options = options || {};

  // Get the regex to use for testing, based on whether
  // leading zeroes are allowed or not.
  const regex = (
    options.hasOwnProperty('allow_leading_zeroes') && !options.allow_leading_zeroes ?
      int : intLeadingZeroes
  );

  // Check min/max/lt/gt
  const value = parseInt(str, 10);
  const minCheckPassed = (options.min === undefined || value >= options.min);
  const maxCheckPassed = (options.max === undefined || value <= options.max);
  const ltCheckPassed = (options.lt === undefined || value < options.lt);
  const gtCheckPassed = (options.gt === undefined || value > options.gt);

  return regex.test(str) && minCheckPassed && maxCheckPassed && ltCheckPassed && gtCheckPassed;
}
