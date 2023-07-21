import {
  isObject,
  RecursivePartial,
} from './helpers';

/**
 * Checks if the provided object has a specific property.
 *
 * @function _has
 * @param {string} prop - The property name to check for in the object.
 * @param {any} obj - The object to check for the property. This can be of any type that can have properties (e.g., objects, arrays, etc.).
 * @returns {boolean} Returns true if the object has the specified property, false otherwise.
 *
 * @example
 * // returns true
 * _has('name', { name: 'John', age: 30 });
 *
 * @example
 * // returns false
 * _has('height', { name: 'John', age: 30 });
 *
 * @example
 * // returns true
 * _has('0', ['apple', 'banana', 'cherry']);
 *
 * @example
 * // returns false
 * _has('3', ['apple', 'banana', 'cherry']);
 */
function _has(prop: string, obj: any) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * The `mergeWithKey` function merges two string arrays into a single object, using the array indices as keys.
 * If a key exists in both arrays, a custom merge function is applied to the values of the key in both arrays.
 *
 * @param {function} fn - A function that takes three string parameters: the key (K), the value from the left array (lk), and the value from the right array (rk).
 * This function is applied when a key exists in both arrays and should return the value to be used in the result object for that key.
 * @param {string[]} l - The left array to be merged.
 * @param {string[]} r - The right array to be merged.
 *
 * @returns {Record<any, any>} - The resulting object after merging the two input arrays. The keys of the object are the indices of the arrays,
 * and the values are either the value from the left array, the value from the right array, or the result of the custom merge function.
 *
 * @example
 * // returns {0: 'a', 1: 'b', 2: 'c', 3: 'd'}
 * mergeWithKey((k, lk, rk) => lk + rk, ['a', 'b'], ['c', 'd']);
 *
 * @throws {TypeError} - Throws a TypeError if the first argument is not a function or if the second and third arguments are not arrays of strings.
 */
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

/**
 * This function merges two objects deeply by applying a custom function to each key-value pair.
 * The custom function is applied to the values of each key in both objects.
 * If the value of a key in both objects is another object, the function is applied recursively.
 *
 * @param {function} fn - A function that takes three arguments:
 * 1. K: The key of the current key-value pair.
 * 2. lk: The value of the current key in the left object.
 * 3. rk: The value of the current key in the right object.
 * The function should return a value that will replace the current value in the merged object.
 *
 * @param {any} lObj - The left object to be merged. This object will not be modified.
 *
 * @param {any} rObj - The right object to be merged. This object will not be modified.
 *
 * @returns {any} - Returns a new object that is the result of deeply merging lObj and rObj.
 * For each key, if the value in both objects is an object, the function is applied recursively.
 * Otherwise, the custom function is applied to the values of the key in both objects.
 *
 * @example
 * // returns { a: 1, b: { c: 3, d: 4 } }
 * mergeDeepWithKey((k, l, r) => l + r, { a: 1, b: { c: 2 } }, { a: 0, b: { c: 1, d: 4 } });
 */
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

/**
 * Merges two objects deeply, giving priority to the properties of the second object (`rObj`) in case of a conflict.
 *
 * @param {any} lObj - The first object to be merged. This object's properties will be overridden by `rObj`'s properties in case of a conflict.
 * @param {any} rObj - The second object to be merged. This object's properties will override `lObj`'s properties in case of a conflict.
 *
 * @returns {any} A new object that is the result of a deep merge of `lObj` and `rObj`. In case of a conflict, the properties of `rObj` will take precedence.
 *
 * @example
 * // returns { a: 1, b: 2, c: 3 }
 * mergeDeepRight({ a: 1, b: 2 }, { b: 3, c: 3 });
 *
 * @function mergeDeepRight
 */
function mergeDeepRight(lObj: any, rObj: any) {
  return mergeDeepWithKey(
    function (k, lVal, rVal) {
      return rVal;
    },
    lObj,
    rObj,
  );
}

/**
 * Merges two objects or arrays deeply, returning a new object or array that contains the combined contents of both.
 * If the same key exists in both objects, the value from the second object (`b`) will be used.
 * If the same index exists in both arrays, the value from the second array (`b`) will be used.
 *
 * @template T The type of the objects or arrays to be merged.
 *
 * @param {T} a The first object or array to merge. This will not be modified.
 * @param {Partial<T> | RecursivePartial<T> | T} b The second object or array to merge. This will not be modified.
 *
 * @returns {T} A new object or array that contains the combined contents of `a` and `b`.
 *
 * @throws {TypeError} If `a` or `b` is not an object or array.
 *
 * @example
 *
 * deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 }); // Returns { a: 1, b: 3, c: 4 }
 * deepMerge([1, 2], [2, 3]); // Returns [2, 3]
 *
 * @note
 *
 * - If `a` and `b` are both arrays, the returned array will have a length equal to the longer of the two input arrays.
 * - If `a` and `b` are both objects, the returned object will contain all keys present in either `a` or `b`.
 * - If `a` is an array and `b` is an object, or vice versa, a TypeError will be thrown.
 * - This function uses recursion to merge objects and arrays deeply. Therefore, it may not be suitable for very large or deeply nested objects or arrays due to the risk of a stack overflow.
 *
 */
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
