import { assertString } from './util/assertString';
import { merge } from './util/merge';

export interface IsEmptyOptions {
  ignore_whitespace?: boolean;
}

const default_is_empty_options = {
  ignore_whitespace: false,
};

export function isEmpty(str: unknown, options: IsEmptyOptions = {}) {
  assertString(str);
  options = merge(options, default_is_empty_options);

  return (options.ignore_whitespace ? str.trim().length : str.length) === 0;
}
