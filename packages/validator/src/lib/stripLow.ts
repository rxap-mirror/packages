import { assertString } from './util/assertString';

import { blacklist } from './blacklist';

export function stripLow(str: unknown, keep_new_lines?: boolean) {
  assertString(str);
  const chars = keep_new_lines ? '\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F' : '\\x00-\\x1F\\x7F';
  return blacklist(str, chars);
}
