import { assertString } from './util/assertString';

/* eslint-disable no-control-regex */
const multibyte = /[^\x00-\x7F]/;

/* eslint-enable no-control-regex */

export function isMultibyte(str) {
  assertString(str);
  return multibyte.test(str);
}
