/**
 * Removes a property from a nested object based on a dot-separated path.
 *
 * This function mutates the original object by deleting the property specified by the `path`.
 * If the path is invalid or does not exist in the object, no action is taken.
 *
 * @param obj The object from which the property will be removed. This should be a valid object.
 * @param path A dot-separated string indicating the nested path to the property that should be removed.
 * For example, "user.name" would target the `name` property inside the `user` object.
 *
 * @example
 * let myObj = { user: { name: "John", age: 30 } };
 * RemoveFromObject(myObj, "user.name");
 * // myObj now equals { user: { age: 30 } }
 *
 * @remarks
 * - The function does not return any value.
 * - If the `path` is an empty string or leads to a non-existent property, the function will not perform any operation.
 * - This function directly modifies the input object (`obj`), so no new object is created.
 * - The function handles only own properties of the object and does not traverse the prototype chain.
 */
export function RemoveFromObject(obj: any, path: string) {

  const fragments: string[] = path.split('.').filter(Boolean);

  if (fragments.length === 0) {
    return;
  }

  if (obj && typeof obj === 'object') {
    const fragment: string = fragments.shift()!;

    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(fragment)) {

      if (fragments.length === 0) {
        if (obj[fragment] !== undefined) {
          delete obj[fragment];
        }
      } else {
        RemoveFromObject(obj[fragment], fragments.join('.'));
      }

    }

  }

}
