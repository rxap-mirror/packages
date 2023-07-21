/**
 * This function is used to assign a specific value to an object's property, based on a given path.
 * The path is a string of property keys separated by dots, representing a nested structure in the object.
 *
 * @export
 * @function SetToObject
 *
 * @param {any} obj - The original object on which a value needs to be set. This can be any JavaScript object.
 *
 * @param {string} path - The path is a string of property keys separated by dots ('.'). It represents the
 *                        sequence of nested properties leading to the one to which the value needs to be assigned.
 *                        For example, in the object `{ a: { b: { c: 0 } } }`, to set a value to the property 'c',
 *                        the path would be 'a.b.c'.
 *
 * @param {any} value - The value to be assigned to the property at the end of the path in the object. It can be of any type.
 *
 * @returns {void} - This function doesn't return anything. It modifies the original object as a side effect.
 *
 * @example
 *
 *   const obj = { a: { b: { c: 0 } } };
 *   SetToObject(obj, 'a.b.c', 42);
 *   console.log(obj); // logs: { a: { b: { c: 42 } } }
 *
 */
export function SetToObject(obj: any, path: string, value: any): void {

  const fragments: string[] = path.split('.').filter(Boolean);

  if (fragments.length === 0) {
    return;
  }

  if (obj && typeof obj === 'object') {
    const fragment: string = fragments.shift()!;

    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(fragment)) {

      if (fragments.length === 0) {
        obj[fragment] = value;
      } else {
        SetToObject(obj[fragment], fragments.join('.'), value);
      }

    } else {

      if (fragments.length === 0) {
        obj[fragment] = value;
      } else {
        obj[fragment] = {};
        SetToObject(obj[fragment], fragments.join('.'), value);
      }

    }

  }

}
