import { assertString } from './util/assertString';

const defaultOptions = {loose: false};
const strictBooleans = ['true', 'false', '1', '0'];
const looseBooleans = [...strictBooleans, 'yes', 'no'];

export function isBoolean(str: unknown, options = defaultOptions) {
  assertString(str);

  if (options.loose) {
    return looseBooleans.includes(str.toLowerCase());
  }

  return strictBooleans.includes(str);
}
