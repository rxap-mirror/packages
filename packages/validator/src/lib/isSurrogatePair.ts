import { assertString } from './util/assertString';

const surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

export function isSurrogatePair(str: unknown) {
  assertString(str);
  return surrogatePair.test(str);
}
