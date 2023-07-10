import {merge} from './util/merge';
import {assertString} from './util/assertString';
import {includes} from './util/includes';
import {decimal} from './alpha';

export interface IsDecimalOptions {
  locale?: string;
  decimal_digits?: string;
  force_decimal?: boolean;
}

function decimalRegExp(options: Required<IsDecimalOptions>) {
  const regExp = new RegExp(`^[-+]?([0-9]+)?(\\${decimal[options.locale]}[0-9]{${options.decimal_digits}})${options.force_decimal ? '' : '?'}$`);
  return regExp;
}

const default_decimal_options = {
  force_decimal: false,
  decimal_digits: '1,',
  locale: 'en-US',
};

const blacklist = ['', '-', '+'];

export function isDecimal(str: unknown, options: IsDecimalOptions = {}) {
  assertString(str);
  const _options: Required<IsDecimalOptions> = merge(options, default_decimal_options);
  if (_options.locale in decimal) {
    return !includes(blacklist, str.replace(/ /g, '')) && decimalRegExp(_options).test(str);
  }
  throw new Error(`Invalid locale '${options.locale}'`);
}
