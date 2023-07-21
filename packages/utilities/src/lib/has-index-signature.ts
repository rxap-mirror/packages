import { KeyValue } from './helpers';

export type WithIndexSignature<T> = T & KeyValue;

/**
 * This function checks if the provided object has an index signature.
 *
 * @export
 * @function hasIndexSignature
 * @template T - The type of the object to be checked.
 * @param {T} obj - The object to be checked for an index signature.
 *
 * @returns {obj is T & KeyValue} - A type predicate indicating whether the object has an index signature.
 * The function returns true if the object is of type 'object' and is not null or undefined.
 * Otherwise, it returns false.
 *
 * @example
 *
 * let obj = { key: 'value' };
 * let result = hasIndexSignature(obj); // result will be true if obj has an index signature
 *
 * @note
 * The function uses the 'typeof' operator to check if the object is of type 'object'.
 * It also uses the logical NOT operator (!!) to convert the object to a boolean value.
 * If the object is null or undefined, the function will return false.
 */
export function hasIndexSignature<T>(obj: T): obj is T & KeyValue {
  return typeof obj === 'object' && !!obj;
}
