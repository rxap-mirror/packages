export interface CoerceArrayItemsOptions<T = any> {
  merge?: boolean,
  compareTo?: (a: T, b: T) => boolean,
  compareFn?: ((a: T, b: T) => number) | null,
  unshift?: boolean,
  replace?: boolean,
}

export const COERCE_ARRAY_ITEMS_DEFAULT_OPTIONS: Required<CoerceArrayItemsOptions> = { merge: false, unshift: false, replace: false, compareTo: (a, b) => a === b, compareFn: null };

/**
 * Normalizes the options for coercing array items by ensuring all required properties are set.
 * This function allows customization of the comparison function and the unshift behavior.
 *
 * @param {CoerceArrayItemsOptions | ((a: T, b: T) => boolean)} [compareToOrOptions=((a, b) => a === b)] - This parameter can either be a function that compares two items of type T, or an object containing options for coercion. If a function is provided, it will be used as the comparison function. If an object is provided, it will be merged with the default options. If omitted, a strict equality comparison function is used by default.
 * @param {boolean} [unshift=false] - Determines whether new items should be unshifted (added to the beginning) of the array. This is only used if the first parameter is a function or if the `unshift` property is not specified in the options object.
 * @returns {Required<CoerceArrayItemsOptions<T>>} - Returns an object containing the normalized options, ensuring both `compareTo` and `unshift` properties are set.
 *
 * @template T - The type of the elements in the array to be coerced.
 *
 * @example
 * // Using a custom comparison function without unshifting
 * const options = CoerceArrayItems_normalizeOptions((item1, item2) => item1.id === item2.id);
 * // options will be { compareTo: (item1, item2) => item1.id === item2.id, unshift: false }
 *
 * @example
 * // Using default comparison with unshift set to true
 * const options = CoerceArrayItems_normalizeOptions(undefined, true);
 * // options will be { compareTo: (a, b) => a === b, unshift: true }
 *
 */
export function CoerceArrayItems_normalizeOptions<T = any>(compareToOrOptions: CoerceArrayItemsOptions | ((a: T, b: T) => boolean) = ((a: T, b: T) => a === b), unshift = false): Required<CoerceArrayItemsOptions<T>> {
  const options: Required<CoerceArrayItemsOptions<T>> = { ...COERCE_ARRAY_ITEMS_DEFAULT_OPTIONS };
  if (!compareToOrOptions) {
    options.unshift = unshift;
  }
  if (typeof compareToOrOptions === 'function') {
    options.compareTo = compareToOrOptions;
    options.unshift = unshift;
  } else {
    Object.assign(options, compareToOrOptions);
  }
  return options;
}

/**
 * Modifies an array by replacing or merging an item at a specified index based on provided options.
 *
 * This function is designed to handle cases where an item already exists in the array. It can either replace
 * the existing item or merge it with the new item based on the configuration specified in the `options` parameter.
 * The function uses a comparator function defined in `options` to find the index of the item if not provided.
 *
 * @param options - An object with the following properties:
 * - `replace`: A boolean that determines if the item should be replaced.
 * - `merge`: A boolean that determines if the item should be merged with the existing item.
 * - `compareTo`: A function that takes two arguments of type T and returns a boolean indicating if they are considered equal.
 * @param array - The array of items of type T.
 * @param item - The item of type T to be added or merged into the array.
 * @param index - Optional. The index at which the item should be modified. If not provided, the index is determined by using the `compareTo` function from `options`.
 *
 * @remarks
 * - If `replace` is true, the item at the specified index is replaced with the new item.
 * - If `merge` is true and both the existing item and the new item are objects, they are merged into a single object.
 * - If the index is not provided, it is determined by finding the first item in the array that matches the `item` using the `compareTo` function.
 * - This function directly modifies the original array.
 */
export function CoerceArrayItems_handleExistsCase<T>(options: Required<CoerceArrayItemsOptions<T>>, array: T[], item: T, index = array.findIndex((a) => options.compareTo(a, item))) {
  if (options.replace) {
    array[index] = item;
  }
  if ( options.merge) {
    const existingItem = array[index];
    if (typeof existingItem === 'object' && typeof item === 'object') {
      if (existingItem) {
        array[index] = { ...existingItem, ...item };
      } else {
        array[index] = item;
      }
    }
  }
}

/**
 * Inserts an item into a sorted array based on a comparison function provided in the options.
 *
 * This function ensures that the array remains sorted after the insertion of the new item. If the `unshift` option is true,
 * the item is inserted in such a way that the first item for which the comparison function returns a negative value will
 * precede the new item. If `unshift` is false, the item is inserted before the first item for which the comparison function
 * returns a positive value. If no such position is found, the item is added to the end of the array.
 *
 * @param {Required<CoerceArrayItemsOptions<T>>} options - An object containing the necessary options for coercion:
 * - `compareFn`: A function that takes two arguments of type T and returns a number. The function should return
 * a negative value if the first argument is less than the second, zero if they're equal, and a positive value
 * otherwise.
 * - `unshift`: A boolean indicating whether to insert the new item at the start of its suitable position (true)
 * or just before a greater item (false).
 * @param {T[]} array - The array into which the item should be inserted. This array should be sorted according to the
 * comparison function provided.
 * @param {T} item - The item to be inserted into the array.
 *
 * @throws {Error} If the `compareFn` is not provided in the options.
 *
 * @example
 * // Define a comparison function for numbers
 * const compareNumbers = (a: number, b: number) => a - b;
 * // Create an array of numbers
 * let numbers = [1, 3, 5, 7];
 * // Options for insertion
 * const options = { compareFn: compareNumbers, unshift: false };
 * // Insert a new number into the sorted array
 * CoerceArrayItems_handleCompareFnCase(options, numbers, 4);
 * console.log(numbers); // Output: [1, 3, 4, 5, 7]
 *
 */
export function CoerceArrayItems_handleCompareFnCase<T>(options: Required<CoerceArrayItemsOptions<T>>, array: T[], item: T) {
  if (!options.compareFn) {
    throw new Error('options.compareFn must be provided when comparing items');
  }
  if (array.length === 0) {
    array.push(item);
    return;
  }
  if (options.unshift) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (options.compareFn(array[i], item) < 0) {
        array.splice(i + 1, 0, item);
        return;
      }
    }
    array.unshift(item);
  } else {
    for (let i = 0; i < array.length; i++) {
      if (options.compareFn(array[i], item) > 0) {
        array.splice(i, 0, item);
        return;
      }
    }
    array.push(item);
  }
}

/**
 * Modifies the given array by adding an item either to the beginning or the end of the array based on the provided options.
 *
 * @param options - An object of type `Required<CoerceArrayItemsOptions<T>>` which includes the property `unshift`.
 * If `unshift` is true, the item is added to the beginning of the array. If false, the item is added to the end.
 * @param array - The array of type `T[]` to which the item will be added.
 * @param item - The item of type `T` to be added to the array.
 *
 * @template T - The type of the elements in the array and the item being added.
 */
export function CoerceArrayItems_handleDefaultCase<T>(options: Required<CoerceArrayItemsOptions<T>>, array: T[], item: T) {
  if (options.unshift) {
    array.unshift(item);
  } else {
    array.push(item);
  }
}

export function CoerceArrayItems<T = any>(array: T[], items: ReadonlyArray<T>, compareTo?: (a: T, b: T) => boolean, unshift?: boolean): void
export function CoerceArrayItems<T = any>(array: T[], items: ReadonlyArray<T>, options?: CoerceArrayItemsOptions): void
/**
 * Modifies the `array` by ensuring that all `items` are included in it based on a comparison strategy.
 *
 * This function iterates over each element in `items`, checks if it exists in `array` using a comparison function,
 * and modifies `array` according to the result of the comparison and the provided options.
 *
 * @param {T[]} array - The array to be modified.
 * @param {ReadonlyArray<T>} items - The items to be coerced into the array.
 * @param {CoerceArrayItemsOptions | ((a: T, b: T) => boolean)} [compareToOrOptions=((a, b) => a === b)] -
 * Either a function used to compare elements of the array, or an options object specifying detailed behavior.
 * By default, items are compared using strict equality.
 * @param {boolean} [unshift=false] - If true, new items are added to the beginning of the array; otherwise, they are added to the end.
 *
 * The function supports several scenarios for handling existing items:
 * 1. If an item is found in the array (as determined by the comparison function), it is handled according to the logic
 * defined in `CoerceArrayItems_handleExistsCase`.
 * 2. If an item is not found and a custom comparison function (`compareFn`) is provided in the options, it is handled
 * according to `CoerceArrayItems_handleCompareFnCase`.
 * 3. If an item is not found and no custom comparison function is provided, it is handled according to
 * `CoerceArrayItems_handleDefaultCase`.
 *
 * Note: The function mutates the original array.
 */
export function CoerceArrayItems<T = any>(array: T[], items: ReadonlyArray<T>, compareToOrOptions: CoerceArrayItemsOptions | ((a: T, b: T) => boolean) = ((a: T, b: T) => a === b), unshift = false) {
  const options = CoerceArrayItems_normalizeOptions(compareToOrOptions, unshift);
  for (const item of items) {
    const index = array.findIndex((a) => options.compareTo(a, item));
    const exists = index !== -1;
    if (exists) {
      CoerceArrayItems_handleExistsCase(options, array, item, index);
    } else if (options.compareFn) {
      CoerceArrayItems_handleCompareFnCase(options, array, item);
    } else {
      CoerceArrayItems_handleDefaultCase(options, array, item);
    }
  }
}
