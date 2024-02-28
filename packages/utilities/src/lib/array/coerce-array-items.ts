export function CoerceArrayItems<T = any>(array: T[], items: T[], compareTo = ((a: T, b: T) => a === b), unshift = false) {
  for (const item of items) {
    if (!array.find((a) => compareTo(a, item))) {
      if (unshift) {
        array.unshift(item);
      } else {
        array.push(item);
      }
    }
  }
}
