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

export function DeleteProperties<T extends object>(obj: T, keys: Array<keyof T>): Partial<T> {

  const clone = { ...obj };

  for (const key of keys) {
    if (obj.hasOwnProperty(key)) {
      delete clone[ key ];
    }
  }

  return clone;
}
