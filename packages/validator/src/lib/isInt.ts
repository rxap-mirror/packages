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
  const minCheckPassed = (options.min === undefined || str.length >= options.min);
  const maxCheckPassed = (options.max === undefined || str.length <= options.max);
  const ltCheckPassed = (options.lt === undefined || str.length < options.lt);
  const gtCheckPassed = (options.gt === undefined || str.length > options.gt);

  return regex.test(str) && minCheckPassed && maxCheckPassed && ltCheckPassed && gtCheckPassed;
}
