export function DeleteProperties<T extends object>(
  obj: T,
  keys: Array<keyof T>
): Partial<T> {
  const clone = { ...obj };

  for (const key of keys) {
    if (obj.hasOwnProperty(key)) {
      delete clone[key];
    }
  }

  return clone;
}
