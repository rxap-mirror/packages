/**
 * Checks if a given object has a specific property, and optionally, if the property has a specific value.
 * This function can also check for nested properties by providing the property key as a string in dot notation.
 *
 * @template T The type of the object to be checked.
 *
 * @param {T} obj The object to be checked.
 * @param {PropertyKey} propertyKey The key of the property to be checked. This can be a string, number, or symbol.
 * If it's a string, it can also be in dot notation to check for nested properties (e.g., 'prop1.prop2.prop3').
 * @param {any} [value] Optional. The value to be checked for the property. If provided, the function will not only check
 * if the property exists, but also if it has this specific value.
 *
 * @returns {propertyKey is keyof T} Returns a type guard indicating whether the property key exists in the object.
 * If the value parameter is provided, it also checks if the property has this specific value.
 *
 * @example
 * // Returns: true
 * hasProperty({ a: 1 }, 'a');
 *
 * @example
 * // Returns: false
 * hasProperty({ a: 1 }, 'b');
 *
 * @example
 * // Returns: true
 * hasProperty({ a: { b: 2 } }, 'a.b');
 *
 * @example
 * // Returns: false
 * hasProperty({ a: { b: 2 } }, 'a.c');
 *
 * @example
 * // Returns: true
 * hasProperty({ a: 1 }, 'a', 1);
 *
 * @example
 * // Returns: false
 * hasProperty({ a: 1 }, 'a', 2);
 *
 */
export function hasProperty<T>(obj: T, propertyKey: PropertyKey, value?: any): propertyKey is keyof T {

  function hasPropertyDeep(obj: any, propertyKey: PropertyKey, value?: any): boolean {
    if (typeof propertyKey === 'string') {

      const fragments = propertyKey.split('.');

      const pk = fragments.pop()!;

      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(pk)) {
        const _obj = obj[pk];
        if (fragments.length) {
          return hasPropertyDeep(_obj, fragments.join('.'));
        } else {
          return value === undefined || _obj === value;
        }
      }

      return false;

    } else {
      // eslint-disable-next-line no-prototype-builtins
      return obj.hasOwnProperty(propertyKey);
    }
  }

  return obj !== null && obj !== undefined && typeof obj === 'object' && hasPropertyDeep(obj, propertyKey);
}
