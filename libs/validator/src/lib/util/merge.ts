export function merge<T>(obj: Partial<T> = {}, defaults: T): T {
  for (const key in defaults) {
    if (typeof obj[ key ] === 'undefined') {
      obj[ key ] = defaults[ key ];
    }
  }
  return obj as T;
}
