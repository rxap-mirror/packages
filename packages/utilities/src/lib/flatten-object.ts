/**
 * This function takes an object and flattens it into a single-level object.
 * Nested properties are represented with dot notation in the resulting object.
 *
 * @export
 * @function flattenObject
 * @param {any} obj - The object to be flattened. This can be of any type, but non-object types will result in an empty object.
 * @param {string} [prefix=''] - An optional prefix to prepend to all property keys in the flattened object. Default is an empty string.
 *
 * @returns {any} - The flattened object. Each key in the returned object represents a path to a property in the original object, with nested properties represented in dot notation. The value of each key is the value of the corresponding property in the original object.
 *
 * @example
 * // returns { 'a.b': 1, 'a.c': 2, d: 3 }
 * flattenObject({ a: { b: 1, c: 2 }, d: 3 });
 *
 * @example
 * // returns { 'prefix.a.b': 1, 'prefix.a.c': 2, 'prefix.d': 3 }
 * flattenObject({ a: { b: 1, c: 2 }, d: 3 }, 'prefix');
 */
export function flattenObject(obj: any, prefix = '') {
  return Object.keys(obj).reduce((acc: any, k: string) => {
    const pre: string = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object') {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}
