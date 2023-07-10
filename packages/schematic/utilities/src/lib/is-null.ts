export function IsNull<T>(value: T | null): value is null {
  return value === null;
}

export function IsNotNull<T>(value: T | null): value is T {
  return !IsNull(value);
}
