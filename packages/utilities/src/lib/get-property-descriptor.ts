/**
 * Retrieves the descriptor for a property of a given object or its prototype chain.
 *
 * @export
 * @function GetPropertyDescriptor
 * @param {any} prototype - The object whose property descriptor is to be retrieved. This can be any valid JavaScript object.
 * @param {PropertyKey} propertyKey - The name or Symbol of the property whose descriptor is to be retrieved.
 * @returns {(PropertyDescriptor | undefined)} - Returns a PropertyDescriptor object, which describes a property on an object, or undefined if no such property exists on the object or its prototype chain.
 *
 * The function first attempts to retrieve the descriptor of the property from the provided object using the built-in `Object.getOwnPropertyDescriptor()` method.
 * If the descriptor is not found on the object itself, the function then checks the object's prototype chain by recursively calling itself with the prototype of the current object.
 * The recursion continues up the prototype chain until the descriptor is found or until it reaches the base Object prototype.
 * If the descriptor is still not found after reaching the base Object prototype, the function returns undefined.
 *
 * Note: The PropertyDescriptor object returned (if any) includes details about the property including its value, whether it's writable, configurable, enumerable, and its getter and setter functions (if any).
 */
export function GetPropertyDescriptor(prototype: any, propertyKey: PropertyKey): PropertyDescriptor | undefined {

  const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyKey);

  if (!descriptor) {
    const parentPrototype = Object.getPrototypeOf(prototype);
    if (parentPrototype !== Object.prototype) {
      return GetPropertyDescriptor(parentPrototype, propertyKey);
    }
  }

  return descriptor;

}
