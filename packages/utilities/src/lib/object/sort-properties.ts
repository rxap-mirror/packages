export function DefaultSortPropertiesCompareFn(a: string, b: string) {
  return a.localeCompare(b);
}

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
  return Object.keys(obj)
               .sort(compareFn)
               .reduce((result, key) => {
                 result[key] = (obj as any)[key];
                 return result;
               }, {} as Record<string, any>) as any;
}
