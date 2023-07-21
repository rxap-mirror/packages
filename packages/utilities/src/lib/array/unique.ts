/**
 * The `unique` function is a higher-order function that returns a callback function. This callback function is used to filter out duplicate values from an array.
 * The function is generic and can work with arrays of any type.
 *
 * @template T The type of elements in the array. It can be any valid TypeScript type.
 *
 * @returns {function} A callback function that takes three parameters: `value`, `index`, and `self`.
 * - `value` (T): The current element being processed in the array.
 * - `index` (number): The index of the current element being processed in the array.
 * - `self` (T[]): The array `filter` was called upon.
 * This callback function returns `true` if the current `value` is the first occurrence in the `self` array (i.e., there are no duplicates before the current index), and `false` otherwise.
 *
 * @example
 * const numbers = [1, 2, 2, 3, 4, 4, 5];
 * const uniqueNumbers = numbers.filter(unique());
 * console.log(uniqueNumbers); // Output: [1, 2, 3, 4, 5]
 *
 * @example
 * const strings = ['a', 'b', 'b', 'c', 'd', 'd', 'e'];
 * const uniqueStrings = strings.filter(unique());
 * console.log(uniqueStrings); // Output: ['a', 'b', 'c', 'd', 'e']
 */
export function unique<T>() {
  return (value: T, index: number, self: T[]) => self.indexOf(value) === index;
}
