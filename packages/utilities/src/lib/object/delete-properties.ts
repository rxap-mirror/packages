export function DeleteProperties<T extends object>(
  obj: T,
  keys: Array<keyof T>,
): Partial<T> {
  const clone = { ...obj };

  for (const key of keys) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      delete clone[key];
    }
  }

  return clone;
}
