/**
 * A generator function that iterates over each property of a given object, including nested properties.
 * It yields an object containing information about each property.
 *
 * @export
 * @function EachProperty
 * @param {any} obj - The object to iterate over. It can be of any type.
 * @param {string[]} [path=[]] - An array of strings representing the path to the current property from the root of the object. Default is an empty array.
 * @param {any} [parent=null] - The parent of the current property. Default is null.
 * @returns {Iterable<any>} - An iterable that yields an object for each property. The object contains the following properties:
 * - value: The value of the current property.
 * - key: The key of the current property.
 * - propertyPath: A string representing the path to the current property from the root of the object.
 * - isObject: A boolean indicating whether the current property is an object (not including arrays).
 * - isArray: A boolean indicating whether the current property is an array.
 * - isPrimitive: A boolean indicating whether the current property is a primitive value (not an object or array).
 * - parent: The parent of the current property.
 * If the current property is an object or an array, the function recursively iterates over its properties.
 *
 * @example
 * const obj = { a: 1, b: { c: 2, d: [3, 4] } };
 * for (const prop of EachProperty(obj)) {
 * console.log(prop);
 * }
 * // Output:
 * // { value: 1, key: 'a', propertyPath: 'a', isObject: false, isArray: false, isPrimitive: true, parent: obj }
 * // { value: { c: 2, d: [3, 4] }, key: 'b', propertyPath: 'b', isObject: true, isArray: false, isPrimitive: false, parent: obj }
 * // { value: 2, key: 'c', propertyPath: 'b.c', isObject: false, isArray: false, isPrimitive: true, parent: { c: 2, d: [3, 4] } }
 * // { value: [3, 4], key: 'd', propertyPath: 'b.d', isObject: false, isArray: true, isPrimitive: false, parent: { c: 2, d: [3, 4] } }
 * // { value: 3, key: '0', propertyPath: 'b.d.0', isObject: false, isArray: false, isPrimitive: true, parent: [3, 4] }
 * // { value: 4, key: '1', propertyPath: 'b.d.1', isObject: false, isArray: false, isPrimitive: true, parent: [3, 4] }
 *
 */
export function* EachProperty(obj: any, path: string[] = [], parent: any = null): Iterable<any> {
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const fullPath = [ ...path, key ];
      const value = obj[key];
      const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
      const isArray = Array.isArray(value);
      const isPrimitive = !isObject && !isArray;

      yield {
        value,
        key,
        propertyPath: fullPath.join('.'),
        isObject,
        isArray,
        isPrimitive,
        parent,
      };

      if (isObject || isArray) {
        yield* EachProperty(value, fullPath, value);
      }
    }
  }
}
