import { isFloat } from './isFloat';

export function toFloat(str) {
  if (!isFloat(str)) {
    return NaN;
  }

  return parseFloat(str);
}
