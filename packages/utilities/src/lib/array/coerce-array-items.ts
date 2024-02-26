export function CoerceArrayItems<T = any>(array: T[], items: T[], compareTo = ((a: T, b: T) => a === b)) {
  for (const item of items) {
    if (!array.find((a) => compareTo(a, item))) {
      array.push(item);
    }
  }
}
