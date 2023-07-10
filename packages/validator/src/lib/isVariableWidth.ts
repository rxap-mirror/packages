import { assertString } from './util/assertString';

import { fullWidth } from './isFullWidth';
import { halfWidth } from './isHalfWidth';

export function isVariableWidth(str: unknown) {
  assertString(str);
  return fullWidth.test(str) && halfWidth.test(str);
}
