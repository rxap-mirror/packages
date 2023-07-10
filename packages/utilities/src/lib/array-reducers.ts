export function objectReducer<T extends object>(a: Partial<T>, b: Partial<T>): Partial<T> {
  return {...a, ...b};
}
