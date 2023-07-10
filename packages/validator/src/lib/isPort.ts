import { isInt } from './isInt';

export function isPort(str: unknown) {
  return isInt(str, {min: 0, max: 65535});
}
