// eslint-disable-next-line @typescript-eslint/ban-types

/**
 * This function deletes null properties from an object and returns a new object with no null properties.
 * If the recursive flag is set, the function will recursively delete null properties from nested objects.
 *
 * @export
 * @template T extends {} A generic parameter that should be an object.
 * @param {T} obj The object from which null properties should be removed.
 * @param {boolean} [recursive=false] An optional boolean parameter indicating whether the function should recursively
 *                                    remove null properties from nested objects.
 * @returns {Exclude<T, null>} The original object but without any null properties.
 *                             If the recursive flag is set, this includes nested objects.
 *
 * @example
 *
 * const inputObj = {
 *    a: 1,
 *    b: null,
 *    c: {
 *      d: 3,
 *      e: null
 *    }
 * }
 *
 * DeleteNullProperties(inputObj);
 * // Returns { a: 1, c: { d: 3, e: null } }
 *
 * DeleteNullProperties(inputObj, true);
 * // Returns { a: 1, c: { d: 3 } }
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function DeleteNullProperties<T extends {}>(obj: T, recursive?: boolean): Exclude<T, null> {
  if (!obj || typeof obj !== 'object') {
    return obj as any;
  }

  const keys = Object.keys(obj);
  const cloneObj: any = {};

  for (const key of keys) {
    if ((obj as any)[key] !== null) {
      const value = (obj as any)[key];
      cloneObj[key] = value;
      if (recursive && value) {
        if (Array.isArray(value)) {
          cloneObj[key] = value.map((item) => DeleteNullProperties(item, true));
        } else if (typeof value === 'object') {
          cloneObj[key] = DeleteNullProperties(value, true);
        }
      }
    }
  }

  return cloneObj;
}
