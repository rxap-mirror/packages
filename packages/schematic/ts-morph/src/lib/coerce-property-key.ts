export function CoercePropertyKey(key: string, drop = false): string {
  if (
    key.match(/(^[0-9]+|-|#|\.|@|\/|:|\*)/) &&
    !key.match(/\[\w+:\s?\w+\]/)
  ) {
    if (drop) {
      return key.replace(/(^[0-9]+|-|#|\.|@|\/|:|\*)/g, '');
    } else {
      return `'${ key }'`;
    }
  }
  return key;
}
