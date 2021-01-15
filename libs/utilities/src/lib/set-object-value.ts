export function SetObjectValue(obj: any, path: string, value: any): void {
  if (obj && typeof obj === 'object') {
    const fragments: string[] = path.split('.').filter(Boolean);
    if (fragments.length === 0) {
      return;
    }
    const fragment: string = fragments.shift()!;
    if (!obj.hasOwnProperty(fragment)) {
      if (fragments.length === 0) {
        obj[ fragment ] = value;
        return;
      } else {
        obj[ fragment ] = {};
      }
    }
    return SetObjectValue(obj[ fragment ], fragments.join('.'), value);
  }
  return;
}
