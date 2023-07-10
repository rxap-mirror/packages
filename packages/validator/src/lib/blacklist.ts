import {assertString} from './util/assertString';

export function blacklist(str: unknown, chars: string) {
  assertString(str);
  return str.replace(new RegExp(`[${chars}]+`, 'g'), '');
}
