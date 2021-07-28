import { assertString } from './util/assertString';

export function blacklist(str, chars) {
  assertString(str);
  return str.replace(new RegExp(`[${chars}]+`, 'g'), '');
}
