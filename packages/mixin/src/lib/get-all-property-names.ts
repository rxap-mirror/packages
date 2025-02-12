/**
 * @summary
 * Returns an array of all property names from a prototype chain, including inherited properties, while excluding duplicates.
 *
 * @param prototype - The prototype object to extract property names from. This can be a class prototype or any object that serves as a prototype.
 *
 * @returns An array of strings containing all unique property names found in the prototype chain, excluding properties from Object.prototype.
 *
 * @example
 * ```typescript
 * class Parent {
 *   parentMethod() {}
 * }
 *
 * class Child extends Parent {
 *   childMethod() {}
 * }
 *
 * const names = GetAllPropertyNames(Child.prototype);
 * // returns ['constructor', 'childMethod', 'parentMethod']
 * ```
 *
 * @example
 * ```typescript
 * const obj = {
 *   method1() {},
 *   prop1: 'value'
 * };
 *
 * const names = GetAllPropertyNames(obj);
 * // returns ['method1', 'prop1']
 * ```
 */
export function GetAllPropertyNames(prototype: any): string[] {

  const names = Object.getOwnPropertyNames(prototype);

  const parentPrototype = Object.getPrototypeOf(prototype);

  if (parentPrototype) {
    if (parentPrototype !== Object.prototype) {
      names.push(...GetAllPropertyNames(parentPrototype));
    }
  }

  return names.filter((name, index, self) => self.indexOf(name) === index);

}
