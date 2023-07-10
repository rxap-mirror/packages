import {isObject, RecursivePartial} from './helpers';

function _has(prop: string, obj: any) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function mergeWithKey(
  fn: (K: string, lk: string, rk: string) => any,
  l: string[],
  r: string[],
) {
  const result: Record<any, any> = {};
  let k;

  for (k in l) {
    if (_has(k, l)) {
      result[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k];
    }
  }

  for (k in r) {
    if (_has(k, r) && !_has(k, result)) {
      result[k] = r[k];
    }
  }

  return result;
}

function mergeDeepWithKey(
  fn: (K: string, lk: string, rk: string) => any,
  lObj: any,
  rObj: any,
): any {
  return mergeWithKey(
    function (k, lVal, rVal) {
      if (isObject(lVal) && isObject(rVal)) {
        return mergeDeepWithKey(fn, lVal, rVal);
      } else {
        return fn(k, lVal, rVal);
      }
    },
    lObj,
    rObj,
  );
}

function mergeDeepRight(lObj: any, rObj: any) {
  return mergeDeepWithKey(
    function (k, lVal, rVal) {
      return rVal;
    },
    lObj,
    rObj,
  );
}

export function deepMerge<T>(a: T, b: Partial<T> | RecursivePartial<T> | T): T {
  if (Array.isArray(a as any) || Array.isArray(b as any)) {
    if (Array.isArray(a as any) && Array.isArray(b as any)) {
      const clone: any[] = (a as any).slice();
      for (let i = 0; i < (b as any).length; i++) {
        if ((b as any)[i] !== undefined) {
          clone[i] = deepMerge(clone[i], (b as any)[i]);
        }
      }
      return clone as any;
    }
  }

  if (!isObject(a) || !isObject(b)) {
    return b as any;
  }

  return mergeDeepRight(a, b) as any;
}
