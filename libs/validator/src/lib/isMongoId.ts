import { assertString } from './util/assertString';

import { isHexadecimal } from './isHexadecimal';

export function isMongoId(str) {
  assertString(str);
  return isHexadecimal(str) && str.length === 24;
}
