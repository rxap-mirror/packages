import {isFloat} from './isFloat';

export function toFloat(str: string) {
  if (!isFloat(str)) {
    return NaN;
  }

  return parseFloat(str);
}
