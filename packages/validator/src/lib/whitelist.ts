import { assertString } from './util/assertString';

export function whitelist(str: unknown, chars: string) {
  assertString(str);
  return str.replace(new RegExp(`[^${ chars }]+`, 'g'), '');
}
