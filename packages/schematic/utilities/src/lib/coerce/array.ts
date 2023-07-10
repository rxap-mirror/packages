export function coerceArray<T>(value?: T | T[] | null): T[] {
  return value === null || value === undefined ? [] : Array.isArray(value) ? value : [value];
}
