import { rtrim } from './rtrim';
import { ltrim } from './ltrim';

export function trim(str, chars) {
  return rtrim(ltrim(str, chars), chars);
}
