/**
 * Removes undefined properties from an object.
 * If the 'recursive' argument is set to true, this function will recursively remove undefined properties from nested objects.
 *
 * @export
 * @template T A generic object type
 * @param {T} obj The object from which to remove undefined properties
 * @param {boolean} [recursive=false] Optional. A boolean indicating whether to recursively remove undefined properties. Defaults to false.
 * @returns {Exclude<T, undefined>} A new object of type T, but with all undefined properties removed.
 * If the 'recursive' argument is set to true, the returned object will have undefined properties removed from nested objects.
 *
 * @example
 * const obj = { a: 1, b: undefined, c: { d: 4, e: undefined } };
 * DeleteUndefinedProperties(obj, true); // returns { a: 1, c: { d: 4 } }
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function DeleteUndefinedProperties<T extends {}>(obj: T, recursive?: boolean): Exclude<T, undefined> {
  if (!obj || typeof obj !== 'object') {
    return obj as any;
  }

  const keys = Object.keys(obj);
  const cloneObj: any = {};

  for (const key of keys) {
    if ((obj as any)[key] !== undefined) {
      const value = (obj as any)[key];
      cloneObj[key] = value;
      if (recursive && value) {
        if (Array.isArray(value)) {
          cloneObj[key] = value.map((item) => DeleteUndefinedProperties(item, true));
        } else if (typeof value === 'object') {
          cloneObj[key] = DeleteUndefinedProperties(value, true);
        }
      }
    }
  }

  return cloneObj;
}
