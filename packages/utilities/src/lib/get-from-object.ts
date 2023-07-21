import { hasIndexSignature } from './has-index-signature';

/**
 * This function retrieves a value from a nested object structure based on a provided path. If the path does not exist, it returns a default value.
 *
 * @template T The expected return type of the value at the end of the path.
 * @template D The type of the default value, which defaults to undefined if not provided.
 *
 * @param {object} obj The object from which to retrieve the value.
 * @param {string} path The path to the value in the object, represented as a string with properties separated by dots (e.g., 'prop1.prop2.prop3').
 * @param {D} [defaultValue] The value to return if the path does not exist in the object. If not provided, it defaults to undefined.
 *
 * @returns {T | D} The value at the end of the path in the object, or the default value if the path does not exist.
 *
 * @throws {TypeError} If the provided object is not actually an object, the function will return the default value.
 *
 * @example
 *
 * const obj = { a: { b: { c: 42 } } };
 * const path = 'a.b.c';
 * const defaultValue = 'default';
 *
 * getFromObject(obj, path, defaultValue); // returns 42
 * getFromObject(obj, 'a.b.d', defaultValue); // returns 'default'
 * getFromObject(42, path, defaultValue); // returns 'default'
 *
 */
export function getFromObject<T, D = undefined>(obj: object, path: string, defaultValue?: D): T | D {

  const fragments: string[] = path.split('.').filter(Boolean);

  if (fragments.length === 0) {
    return obj as any;
  }

  if (!obj) {
    return defaultValue as any;
  }

  if (typeof obj !== 'object') {
    return defaultValue as any;
  }

  const fragment: string = fragments.shift()!;

  // eslint-disable-next-line no-prototype-builtins
  if (obj.hasOwnProperty(fragment) && hasIndexSignature(obj)) {
    return getFromObject(obj[fragment], fragments.join('.'), defaultValue);
  }

  return defaultValue as any;

}

/**
 * `GetFromObjectFactory` is a higher-order function that creates a function to retrieve a value from an object by a given path.
 * If the path does not exist in the object, it returns a default value.
 *
 * @template T The expected return type of the value at the given path in the object.
 * @template D The type of the default value. It defaults to `undefined` if not provided.
 *
 * @param {string} path The path to the value in the object. It should be a string of keys separated by dots.
 * For example, for the object `{ a: { b: { c: 'value' } } }`, the path to 'value' would be 'a.b.c'.
 *
 * @param {D} [defaultValue] The value to return if the path does not exist in the object. It is optional and defaults to `undefined`.
 *
 * @returns {(obj: object) => T | D} A function that takes an object and returns the value at the given path, or the default value if the path does not exist.
 * The returned function has the signature `(obj: object) => T | D`.
 *
 * @example
 * const getFromObject = GetFromObjectFactory<number>('a.b.c', 0);
 * const obj = { a: { b: { c: 123 } } };
 * console.log(getFromObject(obj)); // Outputs: 123
 *
 * const obj2 = { a: { b: {} } };
 * console.log(getFromObject(obj2)); // Outputs: 0
 */
export function GetFromObjectFactory<T, D = undefined>(path: string, defaultValue?: D): (obj: object) => T | D {
  return (obj: object) => getFromObject(obj, path, defaultValue);
}

/**
 * @deprecated use GetFromObjectFactory instead
 */
export const getFromObjectFactory = GetFromObjectFactory;

