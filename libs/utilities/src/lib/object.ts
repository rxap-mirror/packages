export function DeleteUndefinedProperties<T>(obj: T): Partial<T> {
  const keys          = Object.keys(obj);
  const cloneObj: any = {};

  for (const key of keys) {
    if ((obj as any)[ key ] !== undefined) {
      cloneObj[ key ] = (obj as any)[ key ];
    }
  }

  return cloneObj;
}
