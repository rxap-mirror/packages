export interface CoerceArrayItemsOptions<T = any> {
  merge?: boolean,
  compareTo?: (a: T, b: T) => boolean,
  unshift?: boolean,
  replace?: boolean,
}

export function CoerceArrayItems<T = any>(array: T[], items: T[], compareTo?: (a: T, b: T) => boolean, unshift?: boolean): void
export function CoerceArrayItems<T = any>(array: T[], items: T[], options?: CoerceArrayItemsOptions): void
export function CoerceArrayItems<T = any>(array: T[], items: T[], compareToOrOptions: CoerceArrayItemsOptions | ((a: T, b: T) => boolean) = ((a: T, b: T) => a === b), unshift = false) {
  const options: Required<CoerceArrayItemsOptions<T>> = { merge: false, unshift: false, replace: false, compareTo: (a, b) => a === b };
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
    } else {
      if (unshift) {
        array.unshift(item);
      } else {
        array.push(item);
      }
    }
  }
}
