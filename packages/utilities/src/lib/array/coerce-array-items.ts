export interface CoerceArrayItemsOptions<T = any> {
  merge?: boolean,
  compareTo?: (a: T, b: T) => boolean,
  compareFn?: ((a: T, b: T) => number) | null,
  unshift?: boolean,
  replace?: boolean,
}

export const COERCE_ARRAY_ITEMS_DEFAULT_OPTIONS: Required<CoerceArrayItemsOptions> = { merge: false, unshift: false, replace: false, compareTo: (a, b) => a === b, compareFn: null };

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

export function CoerceArrayItems_handleDefaultCase<T>(options: Required<CoerceArrayItemsOptions<T>>, array: T[], item: T) {
  if (options.unshift) {
    array.unshift(item);
  } else {
    array.push(item);
  }
}

export function CoerceArrayItems<T = any>(array: T[], items: ReadonlyArray<T>, compareTo?: (a: T, b: T) => boolean, unshift?: boolean): void
export function CoerceArrayItems<T = any>(array: T[], items: ReadonlyArray<T>, options?: CoerceArrayItemsOptions): void
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
