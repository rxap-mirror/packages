/**
 * Recursively retrieves the property descriptor for a given property key from a prototype chain.
 *
 * @param prototype - The prototype object to start searching from. Can be any object that might have the property.
 * @param propertyKey - The key of the property to find the descriptor for. Can be a string, symbol, or number.
 *
 * @returns The property descriptor if found, or undefined if the property is not found in the prototype chain.
 *
 * @example
 * ```typescript
 * class Parent {
 *   get value() { return 42; }
 * }
 * class Child extends Parent {}
 *
 * const descriptor = GetPropertyDescriptor(Child.prototype, 'value');
 * // Returns the getter descriptor from Parent
 * ```
 *
 * @example
 * ```typescript
 * const obj = { prop: 'value' };
 * const descriptor = GetPropertyDescriptor(obj, 'prop');
 * // Returns { value: 'value', writable: true, enumerable: true, configurable: true }
 * ```
 *
 * @throws Will not throw any errors, but returns undefined if the property is not found or if the prototype chain ends.
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
