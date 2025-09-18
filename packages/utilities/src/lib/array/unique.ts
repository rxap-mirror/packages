/**
 * Represents a function that compares two values of the same type and determines their equality.
 *
 * @callback CompareTo
 * @template T - The type of the elements to compare.
 * @param {T} a - The first element to compare.
 * @param {T} b - The second element to compare.
 * @returns {boolean} - A boolean indicating whether the two elements are equal based on the comparison logic.
 */
export type CompareTo<T> = (a: T, b: T) => boolean;

/**
 * Creates a function that can be used to filter an array of objects, ensuring
 * that objects with the same combination of specified property values appear only once.
 *
 * @template T The type of elements in the array. It can be any valid TypeScript type.
 *
 * @param {Array<keyof T>} propertyKeys - An array of property keys used to determine uniqueness.
 * @return {(value: T, index: number, self: T[]) => boolean} A predicate function that returns true for the first occurrence of an object
 * with unique values for the specified properties and false for subsequent occurrences.
 */
export function unique<T>(propertyKeys: Array<keyof T>): (value: T, index: number, self: T[]) => boolean;
/**
 * Generates a predicate function to filter unique elements in an array based on a comparison function.
 *
 * @param compareTo - A comparison function that determines if two elements are considered equal.
 * @return A predicate function that can be used in array filtering to retain unique elements.
 */
export function unique<T>(compareTo: CompareTo<T>): (value: T, index: number, self: T[]) => boolean;
/**
 * Creates a predicate function to determine uniqueness of elements in an array.
 * The uniqueness can be determined either by a comparison function or by specific keys of the objects.
 *
 * @template T The type of elements in the array. It can be any valid TypeScript type.
 *
 * @param {CompareTo<T> | Array<keyof T>} [compareToOrKeys=((a, b) => a === b)] - A comparison function that defines how two elements are compared
 * for equality or an array of keys to compare when working with objects.
 * @return {(value: T, index: number, self: T[]) => boolean} A predicate function that can be used to filter unique elements from an array.
 */
export function unique<T>(compareToOrKeys: CompareTo<T> | Array<keyof T> = ((a, b) => a === b)): (value: T, index: number, self: T[]) => boolean {
  const compareTo = typeof compareToOrKeys === 'function' ? compareToOrKeys : (a: T, b: T) => {
    for (const key of compareToOrKeys) {
      if (a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  };
  return (value: T, index: number, self: T[]) => self.findIndex(item => compareTo(value, item)) === index;
}
