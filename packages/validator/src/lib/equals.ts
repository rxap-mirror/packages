import {assertString} from './util/assertString';

export function equals(str: unknown, comparison: string) {
  assertString(str);
  return str === comparison;
}
