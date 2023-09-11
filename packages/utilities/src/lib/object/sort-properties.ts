export function DefaultSortPropertiesCompareFn(a: string, b: string) {
  return a.localeCompare(b);
}

/**
 * Sort the properties of an object in place
 * @param obj
 * @param compareFn
 */
export function SortProperties<T>(
  obj: T,
  compareFn: (a: string, b: string) => number = DefaultSortPropertiesCompareFn,
): T {
  if (!obj) {
    throw new Error('Input is null or undefined');
  }
  if (typeof obj !== 'object') {
    throw new Error('Input is not an object');
  }
  const shallowClone = { ...obj };
  Object.keys(shallowClone).forEach((key) => delete (obj as any)[key]);
  Object.keys(shallowClone)
               .sort(compareFn)
        .forEach((key) => (obj as any)[key] = (shallowClone as any)[key]);
  return obj;
}
