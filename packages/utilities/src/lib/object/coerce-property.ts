/**
 * This function is used to set a value to a property of an object. The property can be nested within the object.
 * If the property does not exist, it will be created.
 *
 * @export
 * @param {Record<any, any> | object} obj - The object in which the property is to be set. This can be a simple object or a complex object with nested properties.
 * @param {string} propertyPath - A string representing the path to the property. The path should be specified with dot notation (e.g., 'property1.property2.property3').
 * @param {any} value - The value to be set to the property.
 *
 * @throws {Error} Will throw an error if the propertyPath is an empty string.
 *
 * @example
 * // Assuming we have the following object:
 * // let obj = { a: { b: { c: 2 } } };
 * // And we want to set the value of 'c' to 3, we would use:
 * // CoerceProperty(obj, 'a.b.c', 3);
 * // Now, obj.a.b.c equals 3.
 *
 * @example
 * // If the property does not exist, it will be created:
 * // let obj = { a: { b: { } } };
 * // CoerceProperty(obj, 'a.b.c', 3);
 * // Now, obj.a.b.c equals 3.
 *
 * @example
 * // If the nested object does not exist, it will be created:
 * // let obj = { a: { } };
 * // CoerceProperty(obj, 'a.b.c', 3);
 * // Now, obj.a.b.c equals 3.
 */
export function CoerceProperty(obj: Record<any, any> | object, propertyPath: string, value: any) {

  const pathList = propertyPath.split('.');

  if (pathList.length === 0) {
    throw new Error('FATAL: path list is empty');
  }

  const firstPath = pathList.shift()!;

  // eslint-disable-next-line no-prototype-builtins
  if (!obj.hasOwnProperty(firstPath)) {
    if (pathList.length === 0) {
      (obj as any)[firstPath] = value;
    } else {
      (obj as any)[firstPath] = {};
    }
  }

  if (pathList.length) {
    CoerceProperty((obj as any)[firstPath], pathList.join('.'), value);
  }

}
