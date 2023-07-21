/**
 * Deletes specified properties from a given object and returns a new object without those properties.
 *
 * @template T - A generic type that extends object. This function can be used with any object type.
 *
 * @param {T} obj - The original object from which properties are to be deleted. This object is not mutated.
 *
 * @param {Array<keyof T>} keys - An array of keys (properties) of the object that are to be deleted.
 * The keys should exist in the object, if not they will be ignored.
 *
 * @returns {Partial<T>} - A new object that is a clone of the original object but without the specified properties.
 * The returned object is of type Partial<T>, meaning it may not have all the properties of the original object.
 *
 * @example
 *
 * const obj = { a: 1, b: 2, c: 3 };
 * const keys = ['a', 'b'];
 * const result = DeleteProperties(obj, keys);
 * console.log(result); // Output: { c: 3 }
 *
 * @note This function uses the spread operator ({ ...obj }) to create a shallow copy of the object.
 * Therefore, it will not work correctly with nested objects.
 *
 * @throws This function does not throw any errors.
 */
export function DeleteProperties<T extends object>(
  obj: T,
  keys: Array<keyof T>,
): Partial<T> {
  const clone = { ...obj };

  for (const key of keys) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      delete clone[key];
    }
  }

  return clone;
}
