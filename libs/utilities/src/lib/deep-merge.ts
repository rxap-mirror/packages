import {
  isObject,
  RecursivePartial
} from './helpers';
import { mergeDeepRight } from 'ramda';

export function deepMerge<T>(a: T, b: Partial<T> | RecursivePartial<T> | T): T {
  if (!isObject(a) || !isObject(b)) {
    return b as any;
  }

  if (Array.isArray(a as any) || Array.isArray(b as any)) {
    if (Array.isArray(a as any) && Array.isArray(b as any)) {
      const clone: any[] = (a as any).slice();
      for (let i = 0; i < (b as any).length; i++) {
        if ((b as any)[ i ] !== undefined) {
          clone[ i ] = deepMerge(clone[ i ], (b as any)[ i ]);
        }
      }
      return clone as any;
    }
    return b as any;
  }

  return mergeDeepRight(a, b) as any;

}
