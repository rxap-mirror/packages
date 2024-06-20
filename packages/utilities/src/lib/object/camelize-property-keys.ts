import { camelize } from '../strings';

export type CamelCase<T extends string> =
  string extends T ? string :
  T extends `${ infer P1 }_${ infer P2 }` ?
  `${ Lowercase<P1> }${ Capitalize<CamelCase<P2>> }` :
  Lowercase<T>;

// Mapped type to apply camelization to all keys of an object
export type CamelizedKeys<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K];
};


/**
 * Transforms the property keys of the given object from any case (e.g., snake_case, kebab-case) to camelCase.
 *
 * This function iterates over each property of the object. If the property belongs directly to the object (not inherited),
 * it converts the key to camelCase using the `camelize` function. If the camelCase version of the key is different from the original,
 * the function adds a new property with the camelized key and the same value, while keeping the original property.
 *
 * Note: This function modifies the original object and also returns it, allowing for chaining or immediate use of the modified object.
 *
 * Type Parameters:
 * - `T`: The type of the input object. This generic type allows the function to accept any object and return an object of the same type
 * with camelized keys.
 *
 * @param {T} obj - The object whose property keys will be camelized.
 * @returns {CamelizedKeys<T> & T} The original object with camelized property keys, conforming to both the original type `T` and
 * a type where the keys are camelized (`CamelizedKeys<T>`).
 *
 * @example
 * const myObj = { user_id: 1, user_name: "John" };
 * const camelizedObj = CamelizePropertyKeys(myObj);
 * console.log(camelizedObj); // Output: { user_id: 1, user_name: "John", userId: 1, userName: "John" }
 */
export function CamelizePropertyKeys<T>(obj: T): CamelizedKeys<T> & T {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const normalizedKey = camelize(key);
      if (normalizedKey !== key) {
        (
          obj as any
        )[normalizedKey] = obj[key];
      }
    }
  }
  return obj as CamelizedKeys<T> & T;
}
