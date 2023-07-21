/* eslint-disable @typescript-eslint/ban-types */
import { DeleteUndefinedProperties } from './delete-undefined-properties';
import { DeleteNullProperties } from './delete-null-properties';

/**
 * Deletes all properties from an object that are either null or undefined.
 *
 * @template T - The type of the object. It must be an object type.
 *
 * @param {T} obj - The object from which to delete the properties. This object is not modified.
 *
 * @param {boolean} [recursive=false] - Optional. If true, the function will recursively delete null and undefined properties from all nested objects and arrays within the object. If false or omitted, the function will only delete null and undefined properties from the top level of the object.
 *
 * @returns {Exclude<Exclude<T, null>, undefined>} - A new object of the same type as the input object, but with all null and undefined properties removed. If the recursive option is true, all nested objects and arrays within the object will also have their null and undefined properties removed.
 *
 * @example
 * // returns { a: 1, c: { d: 4 } }
 * DeleteEmptyProperties({ a: 1, b: null, c: { d: 4, e: undefined } }, true);
 *
 * @example
 * // returns { a: 1, c: { d: 4, e: undefined } }
 * DeleteEmptyProperties({ a: 1, b: null, c: { d: 4, e: undefined } });
 *
 * @throws {TypeError} - If the input object is not an object.
 *
 */
export function DeleteEmptyProperties<T extends {}>(obj: T, recursive?: boolean): Exclude<Exclude<T, null>, undefined> {
  return DeleteUndefinedProperties(DeleteNullProperties(obj, recursive), recursive);
}
