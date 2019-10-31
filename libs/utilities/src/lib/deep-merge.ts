import {
  isObject,
  RecursivePartial
} from './helpers';
import { mergeDeepRight } from 'ramda';

export function deepMerge<T>(a: T, b: Partial<T> | RecursivePartial<T> | T): T {
  if (!isObject(a) || !isObject(b)) {
    return b as any;
  }

  return mergeDeepRight(a, b) as any;

}
