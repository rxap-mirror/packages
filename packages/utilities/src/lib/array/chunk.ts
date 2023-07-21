/**
 * The `Chunk` function is a generic function that takes an array and a chunk size as parameters, and returns a new array where the original array is divided into chunks (sub-arrays) of the specified size.
 *
 * @template T The type of elements in the input array.
 *
 * @param {T[]} array The input array to be chunked. This array can contain elements of any type `T`.
 *
 * @param {number} chunkSize The size of each chunk. This is a positive integer that determines how many elements each chunk (sub-array) should contain.
 *
 * @returns {Array<T[]>} The function returns a new array of arrays (chunks). Each chunk is a sub-array of the input array, containing `chunkSize` number of elements. The last chunk may contain less than `chunkSize` number of elements if the size of the input array is not a multiple of `chunkSize`.
 *
 * @example
 * // returns [[1, 2], [3, 4], [5]]
 * Chunk([1, 2, 3, 4, 5], 2)
 *
 * @example
 * // returns [["a", "b", "c"], ["d", "e", "f"], ["g"]]
 * Chunk(["a", "b", "c", "d", "e", "f", "g"], 3)
 *
 * @throws {Error} If `chunkSize` is less than or equal to 0, the function will not throw an error, but it will enter an infinite loop.
 */
export function Chunk<T>(array: T[], chunkSize: number): Array<T[]> {
  const chunked = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunked.push(array.slice(i, i + chunkSize));
  }
  return chunked;
}
