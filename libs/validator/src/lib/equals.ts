import { assertString } from './util/assertString';

export function equals(str, comparison) {
  assertString(str);
  return str === comparison;
}
