export function CoerceArrayItems(array: any[], items: any[], compareTo = ((a: any, b: any) => a === b)) {
  for (const item of items) {
    if (!array.find((a) => compareTo(a, item))) {
      array.push(item);
    }
  }
}
