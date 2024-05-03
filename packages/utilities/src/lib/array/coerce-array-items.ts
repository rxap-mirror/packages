export interface CoerceArrayItemsOptions<T = any> {
  merge?: boolean,
  compareTo?: (a: T, b: T) => boolean,
  compareFn?: ((a: T, b: T) => number) | null,
  unshift?: boolean,
  replace?: boolean,
}

export function CoerceArrayItems<T = any>(array: T[], items: ReadonlyArray<T>, compareTo?: (a: T, b: T) => boolean, unshift?: boolean): void
export function CoerceArrayItems<T = any>(array: T[], items: ReadonlyArray<T>, options?: CoerceArrayItemsOptions): void
export function CoerceArrayItems<T = any>(array: T[], items: ReadonlyArray<T>, compareToOrOptions: CoerceArrayItemsOptions | ((a: T, b: T) => boolean) = ((a: T, b: T) => a === b), unshift = false) {
  const options: Required<CoerceArrayItemsOptions<T>> = { merge: false, unshift: false, replace: false, compareTo: (a, b) => a === b, compareFn: null };
  if (!compareToOrOptions) {
    options.unshift = unshift;
  }
  if (typeof compareToOrOptions === 'function') {
    options.compareTo = compareToOrOptions;
    options.unshift = unshift;
  } else {
    Object.assign(options, compareToOrOptions);
  }
  for (const item of items) {
    const index = array.findIndex((a) => options.compareTo(a, item));
    const exists = index !== -1;
    if (exists) {
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
    } else if (options.compareFn) {
      if (unshift) {
        for (let i = array.length - 1; i >= 0; i--) {
          if (options.compareFn(array[i], item) < 0) {
            array.splice(i + 1, 0, item);
            break;
          }
        }
      } else {
        for (let i = 0; i < array.length; i++) {
          if (options.compareFn(array[i], item) > 0) {
            array.splice(i, 0, item);
            break;
          }
        }
      }
    } else {
      if (unshift) {
        array.unshift(item);
      } else {
        array.push(item);
      }
    }
  }
}
